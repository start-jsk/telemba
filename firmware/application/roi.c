#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include "roi.h"

#define DEBUG   0

#if 1
// エンディアンの変換
unsigned short htons (unsigned short n)
{
    unsigned short h;
    unsigned char* c = (unsigned char*)&n;
    ((unsigned char*)&h)[0] = c[1];
    ((unsigned char*)&h)[1] = c[0];
    return h;
}

// エンディアンの変換
unsigned short ntohs (unsigned short n)
{
    unsigned short h;
    unsigned char* c = (unsigned char*)&n;
    ((unsigned char*)&h)[0] = c[1];
    ((unsigned char*)&h)[1] = c[0];
    return h;
}
#endif

/**
 *  @brief  掃除の開始
 *  @param  buff    コマンドバッファ
 *  @retval         コマンドのサイズ
 */
int roi_set_clean (unsigned char* buff)
{
    buff[0] = ROICMD_CLEAN;
    return 1;
}

/**
 *  @brief  ROIのモニタ開始
 *  @param  buff    コマンドバッファ
 *  @retval         コマンドのサイズ
 */
int roi_set_start (unsigned char* buff)
{
    buff[0] = ROICMD_START;
    return 1;
}

/**
 *  @brief  ボーレートの設定
 */
int roi_set_baud (unsigned char* buff, int baud)
{
    buff[0] = ROICMD_BAUD;
    buff[1] = 10;
    return 2;
}

/**
 *  @brief  ROIの操作開始
 */
int roi_set_control (unsigned char* buff)
{
    buff[0] = ROICMD_CONTROL;
    return 1;
}

/**
 *  @brief  safeモードへ移行
 *  @param  buff    コマンドバッファ
 *  @retval         コマンドのサイズ
 */
int roi_set_safe (char* buff)
{
    buff[0] = ROICMD_SAFE;
    return 1;
}

/**
 *  @brief  電源のON/OFF
 */
int roi_set_power (char* buff)
{
    buff[0] = ROICMD_POWER;
    return 1;
}

/**
 *  @brief  DRIVEコマンド
 */
int roi_set_drive (char* buff, short v, short r)
{
    char*   vel;
    char*   rad;
    vel = (char*)&v;
    rad = (char*)&r;
    // CAUTION: endian
    buff[0] = ROICMD_DRIVE;
    buff[1] = vel[1];
    buff[2] = vel[0];
    buff[3] = rad[1];
    buff[4] = rad[0];
    return 5;
}

/**
 *  @brief  DRIVEコマンド
 */
int roi_get_drive (char* buff, short* pos_vel, short* radius)
{
    char* vel;
    char* rad;
    vel = (char*)pos_vel;
    rad = (char*)radius;

    // CAUTION: endian
    vel[1] = buff[1];
    vel[0] = buff[2];
    rad[1] = buff[3];
    rad[0] = buff[4];
    return 0;
}

/**
 *  @brief  MOTORSコマンド
 */
int roi_get_motors (char* buff, int* side_brush, int* vacuum, int* main_brush)
{
    *main_brush = (buff[1] >> 2) & 0x01;
    *vacuum = (buff[1] >> 1) & 0x01;
    *side_brush = buff[1] & 0x01;
    return 0;
}

/**
 *  @brief SERVOコマンド
 */
int roi_get_servo (char* buff, short* pwm_ref)
{
    char*   pwm;
    pwm = (char*)pwm_ref;
    // CAUTION: endian
    pwm[1] = buff[1];
    pwm[0] = buff[2];
    return 0;
}

/**
 *@brief  LEDの操作
 */
int roi_set_leds (char* buff, unsigned char leds, unsigned char power_color, unsigned char power_intensity)
{
    buff[0] = ROICMD_LEDS;
    buff[1] = leds;
    buff[2] = power_color;
    buff[3] = power_intensity;
    return 4;
}

/**
 *  @brief  STREAMコマンドの設定
 */
int roi_set_stream (char* buff, int id)
{
    buff[0] = ROICMD_STREAM;
    buff[1] = 1;
    buff[2] = id;
    return 3;
}

/**
 * @brief streamのヘッダを設定する
 * @param buff stream用バッファ
 * @param data 入力データ
 */
int roi_set_stream_response_header (char* buff, unsigned char data)
{
    if (data==19) {
        buff[0] = data;
        return 0;
    }
    return -1;
}

/**
 * @brief streamのヘッダを設定する
 * @param buff stream用バッファ
 * @param c 入力データ
 */
int roi_set_stream_response_size (char *buff, unsigned char c)
{
    buff[1] = c;
    return 0;
}

/**
 * @brief streamのサイズを取得する
 * @param buff stream用バッファ
 */
int roi_get_stream_response_size (char* buff)
{
    if (buff[0] != 19) {
        return 0;
    }
    return ((unsigned char *)buff)[1];
}

/**
 * @brief streamのデータを設定する
 * @param buff stream用バッファ
 */
int roi_set_stream_response_data (char *buff, unsigned int no, char data)
{
    if (no >= roi_get_stream_response_size (buff)) {
	return -1;
    }
    buff[2+no] = data;
    return 0;
}

/**
 * @brief streamのチェックサムを確認する
 * @param buff stream用バッファ
 */
int roi_check_stream_response (char *buff)
{
    return 0;
}

/**
 * @brief streamから左バンパセンサを取得する
 * @param buff stream用バッファ
 * @retval 1 バンパーON
 * @retval 0 バンパーOFF
 */
int roi_get_stream_response_bump_r (char* buff)
{
    if (buff[2] == 0) {
        return roi_get_sensor_response_bump_r (&buff[3]);
    }
    if (buff[2] == 6) {
        return roi_get_sensor_response_bump_r (&buff[3]);
    }
    return 0;
}

/**
 * @brief streamから左バンパセンサを取得する
 * @param buff stream用バッファ
 * @retval 1 バンパーON
 * @retval 0 バンパーOFF
 */
int roi_get_stream_response_bump_l (char* buff)
{
    if (buff[2] == 0) {
        return roi_get_sensor_response_bump_l (&buff[3]);
    }
    if (buff[2] == 6) {
        return roi_get_sensor_response_bump_l (&buff[3]);
    }
    return 0;
}

/**
 * @brief 右側バンパーセンサの値を取得する
 */
int roi_get_sensor_response_bump_r (char* buff)
{
    return buff[0] & 0x01;
}

/**
 * @brief 左側バンパーセンサの値を取得する
 */
int roi_get_sensor_response_bump_l (char* buff)
{
    return buff[0] & 0x02;
}

char* scan_octave (char* arg, int* octave)
{
    char*   p;

    p = arg + 1;

    // 長さの処理
    if (isdigit(*p)) {
        *octave = atoi (p);

#if DEBUG
        fprintf (stderr, "octave=%d\n", *octave);
        fflush (stderr);
#endif

        while (isdigit(*p)) {
#if DEBUG
            fprintf (stderr, "*p=%c\n", *p);
            fflush (stderr);
#endif
            p++;
        }
    }
    return p;
}

char* scan_rest (char* arg, int* length)
{
    char*   p;

    p = arg + 1;

    // 長さの処理
    if (isdigit(*p)) {
        *length = atoi (p);

        while (isdigit(*p)) {
#if DEBUG
            fprintf (stderr, "*p=%c\n", *p);
            fflush (stderr);
#endif
            p++;
        }
    }
    return p;
}

/**
 *  音符ひとかたまりを解析して情報を得る
 */
char* scan_note (char* arg, int* note, int* length)
{
    int notes[12] = {'C', 'X', 'D', 'X', 'E', 'F', 'X', 'G', 'X', 'A', 'X', 'B'};
    char*   p;
    int     i;
    
    *length = 16;

    // 音符の処理
    p = arg;
#if DEBUG
    fprintf (stderr, "note=%c\n", *p);
    fflush (stderr);
#endif
            
    for (i=0; i<12; i++) {
        if (*p==notes[i]) {
            *note = i;
            break;
        }
    }
    // 半音の処理
    p++;
    if (*p=='#' || *p=='+') {
        (*note)++;
        p++;
    }
    else if (*p=='-') {
        (*note)--;
        p++;
    }
    // 長さの処理
    if (isdigit(*p)) {
        *length = atoi (p);

#if DEBUG
        fprintf (stderr, "length=%d\n", *length);
        fflush (stderr);
#endif

        while (isdigit(*p)) {
#if DEBUG
            fprintf (stderr, "*p=%c\n", *p);
            fflush (stderr);
#endif
            p++;
        }
    }

    return p;
}

/**
 *  @brief  曲の登録
 *  @param  buff    コマンドバッファ
 *  @param  args    楽譜データ
 *  @retval         コマンドのサイズ
 *
 *  O4 - オクターブ設定
 *  C4 - 四分音符
 *  C# - ドのシャープ
 */
int roi_song (unsigned char* buff, unsigned char no, char* args)
{
    int     note, octave = 4;
    int     numb = 0;
    int     length;
    char*   p;

#if DEBUG
    fprintf (stderr, "args = %s\n", args);
    fflush (stderr);
#endif

    buff[0] = ROICMD_SONG;
    buff[1] = no;

    for (p=args; *p!='\0'; ) {
        if (*p=='>') {
            octave ++;
            p++;
        }
        if (*p=='<') {
            octave --;
            p++;
        }
        // 音符文字の判定
        if (*p=='O') {
            p = scan_octave (p, &octave);
        }
        if (*p=='R') {
            p = scan_rest (p, &length);
            buff[3+2*numb+0] = 0;
            buff[3+2*numb+1] = length;
            numb ++;
        }
        if (*p=='C' || *p=='D' || *p=='E' || *p=='F' || *p=='G' || *p=='A' || *p=='B') {
            p = scan_note (p, &note, &length);
            buff[3+2*numb+0] = note + (octave + 1)*12;
            buff[3+2*numb+1] = length;
            numb ++;
        }
    }
    buff[2] = numb;

#if DEBUG
    fprintf (stderr, "com = %d, no = %d, numb = %d\n", (int)buff[0], (int)buff[1], (int)buff[2]);
    fflush (stderr);
#endif

    return (3+numb*2);
}

#if 1
int
roi_song2 (char* buff)
{
    buff[0] = ROICMD_SONG;
    buff[1] = 1;
    buff[2] = 12;
    // ド
    buff[3] = 60;
    buff[4] = 16;
    // レ
    buff[5] = 62;
    buff[6] = 16;
    // ミ
    buff[7] = 64;
    buff[8] = 64;
    // レ
    buff[9] = 62;
    buff[10] = 16;
    // ド
    buff[11] = 60;
    buff[12] = 16;
    // ??
    buff[13] = 31;
    buff[14] = 32;
    // ド
    buff[15] = 60;
    buff[16] = 16;
    // レ
    buff[17] = 62;
    buff[18] = 16;
    // ミ
    buff[19] = 64;
    buff[20] = 16;
    // レ
    buff[21] = 62;
    buff[22] = 16;
    // ド
    buff[23] = 60;
    buff[24] = 16;
    // レ
    buff[25] = 62;
    buff[26] = 64;
    return 27;
#endif
    buff[0] = ROICMD_SONG;
    buff[1] = 1;
    buff[2] = 5;
    // レ D4
    buff[3] = 74;
    buff[4] = 32;
    // ミ E4
    buff[5] = 76;
    buff[6] = 32;
    // ド C4
    buff[7] = 72;
    buff[8] = 32;
    // ド C3
    buff[9] = 60;
    buff[10] = 32;
    // ソ G3
    buff[11] = 67;
    buff[12] = 64;
    return 13;
}

int roi_set_play (unsigned char* buff, unsigned char no)
{
    buff[0] = ROICMD_PLAY;
    buff[1] = no;
    return 2;
}

int roi_set_sensor (char* buff, unsigned char packet_id)
{
    buff[0] = ROICMD_SENSORS;
    buff[1] = packet_id;
    return 2;
}

int roi_set_query_list (char* buff, unsigned char numb, unsigned char packet_id_list[])
{
    int i;
    buff[0] = ROICMD_QUERY_LIST;
    buff[1] = numb;
    for (i=0; i<numb; i++) {
	buff[i+2] = packet_id_list[i];
    }
    return 2+numb;
}

int roi_get_query_list_response_size (unsigned char numb, unsigned char packet_id_list[])
{
    return 2+numb;
}

int roi_set_query_list_response (char buff, unsigned char numb, unsigned char packet_id_list[])
{
    return 2+numb;
}

int roi_set_motors (char* buff, int main_brush, int vacuum, int side_brush)
{
    buff[0] = ROICMD_MOTORS;
    buff[1] = 0;

    if (main_brush) {
        buff[1] |= 0x04;
    }
    if (vacuum) {
        buff[1] |= 0x02;
    }
    if (side_brush) {
        buff[1] |= 0x01;
    }
    return 2;
}
typedef struct {
    char    buff[100];
} rot_song_t;

#if 0
/**
 *  文字列での曲の登録
 *
 *  C4 - ドの四分音符
 *  D4E4C4C3G3
 */
roi_song_str (char *buff, char *mml)
{
    char    *p;

    song_cursor = song_buff;

    // 一文字ずつ処理
    while (*p != '\0') {
        if (isspace (*p)) continue;
        if (is_note (*p)) {
            // [A-G] 音符
            if (isalpha (*p)) {
                // ド
                if (*p == 'A') {
                    *song_cursor = 72;
                    song_cursor++;
                    p++;
                    len = strtoi (p);
                    
                        
                }
                        
            }
        }              
    }       
}

#endif
