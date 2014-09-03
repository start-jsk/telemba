/**
 * @file main.c
 * @author Ron Tajima
 * @license MIT License
 *
 * Telemba - Firmware using ADK (Android Accessory Kit)
 *
 * Target: PIC24FJ64GB002
 * IDE: MPLAB X
 * Compiler: XC16
 * Library: MLA(Microchip Library for Application) v2013_06_15 (ADK works with this version only)
 */
#include <USB/usb.h>
#include <USB/usb_host_android.h>
#include <Compiler.h>
#include "HardwareProfile.h"
#include "android.h"
#include "roomba.h"
#include "button.h"
#include "led.h"
#include "servo.h"

// コンフィギュレーションビットの設定
// WDTPS_PS1: Watchdog Timer Postscaler: 1:1
// FWPSA_PR32: WDT Prescaler: Prescaler ratio of 1:32
// WINDIS_OFF: Windowed WDT: Standard Watchdog Timer enabled, (Windowed-mode is disabled)
// FWDTEN_OFF: WDTのON/OFFをソフトウェアで行う
// ICS_PGx: Emulator Pin Placement Select bits: Emulator functions are shared with PGEC1/PGED1
// GWRP_OFF: General Segment Write Protect: Writes to program memory are allowed
// GCP_OFF: General Segment Code Protect: Code protection is disabled
// JTAGEN_OFF: JTAG Port Enable: JTAG port is disabled
_CONFIG1(WDTPS_PS1 & FWPSA_PR32 & WINDIS_OFF & FWDTEN_OFF & ICS_PGx1 & GWRP_OFF & GCP_OFF & JTAGEN_OFF)

// POSCMOD_NONE :       Primary Oscillator Select: Primary Oscillator disabled
// I2C1SEL_PRI I2C1 :   Pin Select bit: Use default SCL1/SDA1 pins for I2C1
// IOL1WAY_OFF :        IOLOCK One-Way Set Enable: The IOLOCK bit can be set and cleared using the unlock sequence
// OSCIOFNC_ON :        OSCO Pin Configuration:  OSCO pin functions as port I/O (RA3)
// FCKSM_CSDCMD :       Clock Switching and Fail-Safe Clock Monitor: Sw Disabled, Mon Disabled
// FNOSC_FRCPLL :       Initial Oscillator Select: Fast RC Oscillator with Postscaler and PLL module (FRCPLL)
// PLL96MHZ_ON :        96mhz PLL Startup Select: 96 MHz PLL Startup is enabled automatically on start-up
// PLLDIV_NODIV :	USB 96 MHz PLL Prescaler Select: Oscillator input used directly (4 MHz input)
// IESO_OFF :           Internal External Switchover:   IESO mode (Two-Speed Start-up) disabled
_CONFIG2(POSCMOD_NONE & I2C1SEL_PRI & IOL1WAY_OFF & OSCIOFNC_ON & FCKSM_CSDCMD & FNOSC_FRCPLL & PLL96MHZ_ON & PLLDIV_NODIV & IESO_OFF)

// WPFP_WPFP0 : Write Protection Flash Page Segment Boundary: Page 0 (0x0)
// SOSCSEL_IO : Secondary Oscillator Pin Mode Select: SOSC pins have digital I/O functions (RA4, RB4)
// WUTSEL_LEG : Voltage Regulator Wake-up Time Select: Default regulator start-up time used
// WPDIS_WPDIS : Segment Write Protection Disable: Segmented code protection disabled
// WPCFG_WPCFGDIS : Write Protect Configuration Page Select: Last page and Flash Configuration words are unprotected
// WPEND_WPENDMEM : Segment Write Protection End Page Select: Write Protect from WPFP to the last page of memory
_CONFIG3(WPFP_WPFP0 & SOSCSEL_IO & WUTSEL_LEG & WPDIS_WPDIS & WPCFG_WPCFGDIS & WPEND_WPENDMEM)

// DSWDTPS_DSWDTPS3 :  DSWDT Postscale Select: 1:128 (132 ms)
// DSWDTOSC_LPRC :      Deep Sleep Watchdog Timer Oscillator Select: DSWDT uses Low Power RC Oscillator (LPRC)
// RTCOSC_SOSC  :       RTCC Reference Oscillator Select: RTCC uses Secondary Oscillator (SOSC)
// DSBOREN_OFF :        Deep Sleep BOR Enable bit: BOR disabled in Deep Sleep
// DSWDTEN_OFF :                Deep Sleep Watchdog Timer:      DSWDT disabled
_CONFIG4(DSWDTPS_DSWDTPS3 & DSWDTOSC_LPRC & RTCOSC_SOSC & DSBOREN_OFF & DSWDTEN_OFF)

// C30 and C32 Exception Handlers
// If your code gets here, you either tried to read or write
// a NULL pointer, or your application overflowed the stack
// by having too many local variables or parameters declared.
void _ISR __attribute__((__no_auto_psv__)) _AddressError(void)
{
    while(1){}
}
void _ISR __attribute__((__no_auto_psv__)) _StackError(void)
{
    while(1){}
}
        
/**
 * main function for processing android connection.
 */
int main (void)
{
    /* システムクロックは32MHz */
    CLKDIV = 0x0100;
    /* LEDの初期化 */
    led_init ();
    /* ボタンの初期化 */
    button_init ();
    /* roombaモジュールの初期化 */
    roomba_init ();
    /* androidモジュールの初期化 */
    android_init ();
    /* サーボの初期化 */
    // servo_init ();
    // メインループ
    for (;;) {
	/* andoridの更新 */
	android_update ();
    }
}

