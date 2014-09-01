#include "Compiler.h"
#include "HardwareProfile.h"

/*
 * サーボ　pin24,25,26 - (RP5)
 * 3.3Vで動くのか？
 */

void servo_init (void)
{
    // TRISBbits.TRISB15 = 0; // asign pin 20 (PB15) to output pin 
    //TRISBbits.TRISB15 = 0; // asign pin 2 (PB) to output pin 
    // こうじゃないか？
    TRISBbits.TRISB13 = 0; // asign pin 24 (RB13) to output pin 
    TRISBbits.TRISB14 = 0; // asign pin 25 (RB14) to output pin 
    TRISBbits.TRISB15 = 0; // asign pin 26 (RB14) to output pin 

    RPOR2bits.RP5R = 18; // OC1 - put on pin 2

    T2CON = 0;
    
    T2CONbits.TCKPS = 0x01; // pre-scaler 1/8
    T2CONbits.TON = 1;		//timer ON

    PR2 = 40000*3/4;   // 20 ms
    OC1CON1 = 0;
    OC1CON2 = 0;
    OC1CON2bits.SYNCSEL = 0x0c;
    OC1R = 3000;//1 ms
    OC1CON1bits.OCTSEL = 0x00;
    OC1CON1bits.OCM = 0x06;
}

/**
 * @birief サーボのパルス幅を設定
 */
void servo_set_pulse (int us)
{
    OC1R = us; // 単位変換が必要
}
