/**
 * @file android.c ADKの通信関連の処理
 */

#include "USB/usb.h"
#include "USB/usb_host_android.h"
#include "android.h"
#include "roi.h"
#include "roomba.h"
#include "led.h"
#include "servo.h"

// If a maximum current rating hasn't been defined, then define 500mA by default
#ifndef MAX_ALLOWED_CURRENT
#define MAX_ALLOWED_CURRENT             (500)         // Maximum power we can supply in mA
#endif

// 端末のハンドラ
static void* dev_handle = NULL;
// 1: 端末と接続中   0: 端末と切断中
//static BOOL dev_flag = FALSE;
// 1: アプリと通信中 0: アプリと切断中
static BOOL app_flag = FALSE;

// アクセサリの情報
static char manufacturer[] = "JSK Startup";
static char model[] = "Roombox";
static char description[] = "Roombox prototype board.";
static char version[] = "2.2";
static char uri[] = "http://www.microchip.com/android";
static char serial[] = "N/A";

ANDROID_ACCESSORY_INFORMATION myDeviceInfo =
{
    manufacturer,
    sizeof(manufacturer),
    model,
    sizeof(model),
    description,
    sizeof(description),
    version,
    sizeof(version),
    uri,
    sizeof(uri),
    serial,
    sizeof(serial)
};

// Roomboxへのコマンドの定義
typedef enum
{
    // アプリとの接続
    COMMAND_APP_CONNECT         = 0xFE,
    // アプリとの切断
    COMMAND_APP_DISCONNECT      = 0xFF,

} roombox_command_t;

/* androidモジュールの初期化 */
void android_init (void)
{
    // USBの初期化
    USBInitialize (0);
    // ADKの初期化
    AndroidAppStart (&myDeviceInfo);
}

static BYTE send_buff[64];
static BYTE recv_buff[64];

/**
 * @brief androidモジュールの更新
 */
int android_update (void)
{
    BYTE err_code;
    DWORD size;
    short v, r;
    short pwm;

    // USBスタックの処理
    USBTasks ();
    // 端末が接続されていない場合
    if (dev_handle == 0) {
        // 速度を0に設定
        roomba_set_drive (0, 0);
	led_set(1, 0);
	return 0;
    }
    size = 0;
    // Androidからの受信が完了している場合
    if (AndroidAppIsReadComplete (dev_handle, &err_code, &size) == TRUE) {
        if (err_code != USB_SUCCESS) {
            // Error
            led_set(1, !led_get(1));
        }
        // Androidからの受信開始
        err_code = AndroidAppRead (dev_handle, recv_buff, (DWORD)sizeof(recv_buff));
        if (err_code != USB_SUCCESS) {
            // Error
        }
        // コマンド処理
        switch (recv_buff[0]) {
        case COMMAND_APP_CONNECT:
            app_flag = TRUE;
            break;
        case COMMAND_APP_DISCONNECT:
            // アンドロイド側の再接続時のバグ回避のための試行
            app_flag = FALSE;
            // err_code = AndroidAppWrite (dev_handle, send_buff, 1);
            break;
        case ROICMD_START:
	    roomba_send_start ();
            break;
        case ROICMD_BAUD:
            break;
        case ROICMD_CONTROL:
	    roomba_send_control ();
            break;
        case ROICMD_SAFE:
	    roomba_send_safe ();
            break;
        case ROICMD_SPOT:
            break;
        case ROICMD_CLEAN:
            roomba_send_clean ();
            break;
        case ROICMD_DRIVE:
            roi_get_drive (recv_buff, &v, &r);
            roomba_set_drive (v, r);
            roomba_set_comm_flag ();
            break;
        case ROICMD_MOTORS:
        {
            int side, vacuum, main;
            roi_get_motors (recv_buff, &side, &vacuum, &main);
            roomba_send_motors (side, vacuum, main);
            break;
        }
        case ROICMD_LEDS:
        case ROICMD_SONG:
        case ROICMD_PLAY:
        case ROICMD_SENSORS:
            break;
        case ROICMD_STREAM:
            roomba_send_stream ();
            break;
        case ROICMD_SERVO:
        {
            roi_get_servo (recv_buff, &pwm);
            servo_set_pulse (pwm);
            break;
        }
        default:
            break;
        }
    }
    size = 0;
    // Androidへの送信が完了している場合
    if (AndroidAppIsWriteComplete (dev_handle, &err_code, &size) == TRUE) {
        if (err_code != USB_SUCCESS) {
        }
        // ルンバからセンサ情報が来たときだけ送る (15ms*8回おき)
        if (roomba_get_sensor_count() >= 10) {
            roomba_set_sensor_count (0);
            roomba_get_stream (send_buff, sizeof(send_buff));
            // Androidへの送信を開始
            err_code = AndroidAppWrite (dev_handle, send_buff, 56);
            if (err_code != USB_SUCCESS ) {
                // Error
            }
        }
    }
    return 0;
}

/**
 * @brief USBのデータイベントの処理を行うハンドラ
 * @param address address of the device causing the event
 * @param event the event that has occurred
 * @param data data associated with the event
 * @param size the size of the data in the data field
 * @return Return TRUE of the event was processed.  Return FALSE if the event wasn't handled.
 */
BOOL USB_ApplicationDataEventHandler( BYTE address, USB_EVENT event, void *data, DWORD size )
{
    return FALSE;
}

/**
 * @brief USBのイベントの処理を行うハンドラ
 * @param address address of the device causing the event
 * @param event the event that has occurred
 * @param data data associated with the event
 * @param size the size of the data in the data field
 * @return Return TRUE of the event was processed.  Return FALSE if the event wasn't handled.
 */
BOOL USB_ApplicationEventHandler( BYTE address, USB_EVENT event, void *data, DWORD size )
{
    switch ((INT)event) {
    case EVENT_VBUS_REQUEST_POWER:
        // 供給電流制限の設定(2倍だと厳しすぎるような気がするので、倍にするか)
        // The data pointer points to a byte that represents the amount of power
        // requested in mA, divided by two.  If the device wants too much power,
        // we reject it.
        // if (((USB_VBUS_POWER_EVENT_DATA*)data)->current <= (MAX_ALLOWED_CURRENT / 2)) {
        if (((USB_VBUS_POWER_EVENT_DATA*)data)->current <= (MAX_ALLOWED_CURRENT*0.8)) {
            return TRUE;
        }
        else {
            // DEBUG_PrintString ("\r\n***** USB Error - device requires too much current *****\r\n");
            return FALSE;
        }
        break;

    case EVENT_VBUS_RELEASE_POWER:
    case EVENT_HUB_ATTACH:
    case EVENT_UNSUPPORTED_DEVICE:
    case EVENT_CANNOT_ENUMERATE:
    case EVENT_CLIENT_INIT_ERROR:
    case EVENT_OUT_OF_MEMORY:
    case EVENT_UNSPECIFIED_ERROR:   // This should never be generated.
    case EVENT_DETACH:              // USB cable has been detached (data: BYTE, address of device)
    case EVENT_ANDROID_DETACH:
        // 端末が切断された場合の処理
        // dev_flag = FALSE;
	dev_handle = 0;
        // 2012-10-01            
        // Reinit the device if a detach is detected
        USBInitialize(0);
        AndroidAppStart (&myDeviceInfo);            
        return TRUE;
    case EVENT_ANDROID_ATTACH:
        // android端末が接続された場合の処理
        dev_handle = data;
        return TRUE;
    default:
        break;
    }
    return FALSE;
}

