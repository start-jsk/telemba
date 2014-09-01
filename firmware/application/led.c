#include "led.h"

/**
 * LEDの初期化
 */
void led_init (void)
{
    // set output RA2, RA3
    TRISAbits.TRISA2 = 0;
    TRISAbits.TRISA3 = 0;
    // set data zero
    LATAbits.LATA2 = 0;
    LATAbits.LATA3 = 0;
}

/**
 * @brief LEDの点灯/消灯
 * @param ch LEDのチャンネル(0-1)
 * @param data 点灯=1, 消灯=0
 */
void led_set (int ch, int data)
{
    switch (ch) {
    case 0:
        LATAbits.LATA2 = data;
        break;
    case 1:
        LATAbits.LATA3 = data;
        break;
    }
}

/**
 * @brief LEDの状態の取得
 * @param ch LEDのチャンネル(0-1)
 * @retval 1 点灯
 * @retval 0 消灯
 */
int led_get (int ch)
{
    switch (ch) {
    case 0:
        return LATAbits.LATA2;
        break;
    case 1:
        return LATAbits.LATA3;
        break;
    }
    return 0;
}

