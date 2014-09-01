#include "Compiler.h"
#include "HardwareProfile.h"
#include "roomba.h"
#include "roi.h"
#include "led.h"
#include "servo.h"

void timer1_enable (void)
{
    IEC0bits.T1IE = 1;  // turn on the timer1 interrupt
}

void timer1_disable (void)
{
    IEC0bits.T1IE = 0;  // turn off the timer1 interrupt
}

static short roomba_drive_v;
static short roomba_drive_r;

/* Roombaからのセンサデータカウンタ */
static int roomba_sensor_count;

/* Roombaからのセンサデータが来ない時間カウント */
static int roomba_sensor_none_count;

/* Roombaからのセンサデータ */
static char roomba_stream_buff[64];

static int roomba_comm_flag;

/**
 * @brief set flag of Android communication
 */
void roomba_set_comm_flag (void)
{
    roomba_comm_flag = 1;
}

/**
 * @brief get counter of receiving sensor data
 */
int roomba_get_sensor_count (void)
{
    return roomba_sensor_count;
}

/**
 * @brief set counter of receiving sensor data
 * @param n count of sensor data
 */
int roomba_set_sensor_count (int n)
{
    roomba_sensor_count = n;
}

/**
 * @brief get sensor stream from roomba
 * @param buff buffer to receive stream data
 * @param size size of the buffer
 */
void roomba_get_stream (char* buff, int size)
{
    timer1_disable ();
    memcpy (buff, roomba_stream_buff, size);
    timer1_enable ();
}

/**
 * roombaの通信の初期化
 */
void roomba_init (void)
{
    // UARTのポートの割り付け
    InitUartPort ();
    // UARTモジュールの初期化
    UART2Init ();
    /* 受信割り込みの許可 */
    IEC1bits.U2RXIE=1;
    /* 送信割り込みの許可 */
    IEC1bits.U2TXIE=0;
    /* 受信割り込みレベルの設定 */
    IPC7bits.U2RXIP = 7;
    /* タイマの初期化 */
    timer1_init ();
}

/**
 * roombaからのセンサ情報の受信
 * 15ms間隔で受信する
 */
void roomba_update_recv (void)
{
    char buff[128];
    int i, size;
    char c;

    /* センサデータが来てるか調べるカウンタ */
    roomba_sensor_none_count ++;

    /* RoobmaのUARTの受信処理 */
    for (;;) {
	/* Group100は80+4byte:head+size+id+data[80]+check_sum */
	/* Group6は52+4byte:head+size+id+data[52]+check_sum */
	/* Group1は10+4byte:head+size+id+data[10]+check_sum */
	if (uart2_recv_get_size () < 56) {
	    break;
	}
	/* streamのヘッダを設定する */
	c = uart2_recv_get_char ();
	if (roi_set_stream_response_header(buff, c) != 0) {
	    continue;
	}
	/* サイズを受信 */
	c = uart2_recv_get_char ();
	if (roi_set_stream_response_size (buff, c) != 0) {
	    continue;
	}
	/* データを受信 */
        size = roi_get_stream_response_size (buff);
	for (i=0; i<size; i++) {
	    c = uart2_recv_get_char();
	    roi_set_stream_response_data (buff, i, c);
	}
	roomba_sensor_count ++;
	roomba_sensor_none_count = 0;

	/* センサデータのコピー */
        memcpy(roomba_stream_buff, buff, sizeof(roomba_stream_buff));
        led_set (0, !led_get(0));
	break;
    }
}

/**
 * roombaへのコマンドの送信
 * 15msに1回ずつ送信する
 */
void roomba_update_send (void)
{
    int size;
    static unsigned char buff[64];
    static int reactive_count;

    /* センサデータが来ない場合 */
    if (roomba_sensor_none_count > 1000) {
        roomba_sensor_none_count = 0;
        led_set (0, !led_get(0));
	/* STREAMコマンドを送る*/
	roomba_send_stream ();
    }
    /* 1秒おきにCONTROLコマンド送信(あとで変更) */
    if (reactive_count % 1000 == 0)  {
        size = roi_set_start (buff);
        uart2_send_data (buff, size);
        size = roi_set_control (buff);
        uart2_send_data (buff, size);
    }        
    /* 50ms周期で送信 */
    if (reactive_count % 50 == 0)  {
        /* Andoridから指令が来てない場合 */
        if (!roomba_comm_flag) {
            roomba_set_drive (0, 0);
        }
        /* センサに応じた回避行動 */
        if (roi_get_stream_response_bump_l(roomba_stream_buff)) {
            roomba_set_drive (-50, 0);
            roomba_comm_flag = 0;
        }
        if (roi_get_stream_response_bump_r (roomba_stream_buff)) {
            roomba_set_drive (-50, 0);
            roomba_comm_flag = 0;
        }
        /* DRIVEコマンドの送信 */
        size = roi_set_drive (buff, roomba_drive_v, roomba_drive_r);
        uart2_send_data (buff, size);
    }
    reactive_count ++;
}

int roomba_update (void)
{
    /* roombaの受信処理 */
    roomba_update_recv ();
    /* roombaの送信処理 */
    roomba_update_send ();
    return 0;
}

/**
 * STARTコマンドの設定
 */
void roomba_send_start (void)
{
    int size;
    char buff[32];
    size = roi_set_start (buff);
    timer1_disable ();
    uart2_send_data (buff, size);
    timer1_enable ();
}

/**
 * CONTROLコマンドの設定
 */
void roomba_send_control (void)
{
    int size;
    char buff[32];
    size = roi_set_control (buff);
    timer1_disable ();
    uart2_send_data (buff, size);
    timer1_enable ();
}

/**
 * SAFEコマンドの設定
 */
void roomba_send_safe (void)
{
    int size;
    char buff[64];
    size = roi_set_safe (buff);
    timer1_disable ();
    uart2_send_data (buff, size);
    timer1_enable ();
}

/**
 * CLEANコマンドの設定
 */
void roomba_send_clean (void)
{
    int size;
    static char buff[64];
    size = roi_set_clean (buff);
    timer1_disable ();
    uart2_send_data (buff, size);
    timer1_enable ();
}

/**
 * DRIVEコマンドの設定
 */
void roomba_set_drive (short v, short r)
{
    /* タイマ割り込みの停止 */
    timer1_disable ();
    roomba_drive_v = v;
    roomba_drive_r = r;
    /* タイマ割り込みの開始 */
    timer1_enable ();
}

/**
 * DRIVEコマンドの設定
 */
void roomba_send_drive (short v, short r)
{
    int size;
    static char buff[64];
    size = roi_set_drive (buff, v, r);
    timer1_disable ();
    uart2_send_data (buff, size);
    timer1_enable ();
}

/**
 * MOTORSコマンドの送信
 */
int roomba_send_motors (int main_brush, int vacuum, int side_brush)
{
    int size;
    static char buff[64];
    size = roi_set_motors (buff, main_brush, vacuum, side_brush);
    timer1_disable ();
    uart2_send_data (buff, size);
    timer1_enable ();
}

/**
 * STREAMコマンドの設定
 */
int roomba_send_stream (void)
{
    int size;
    char buff[64];
    size = roi_set_stream (buff, 6);
    timer1_disable ();
    uart2_send_data (buff, size);
    timer1_enable ();
}

