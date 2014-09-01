#include "HardwareProfile.h"
#include "button.h"

/**
 *　@brief ボタンの初期化
 */
void button_init (void)
{
    /* RA4: Tactile Switch (S2) */
    TRISAbits.TRISA4=1;
}

/**
 *　@brief ボタン状態の取得
 *  @reval 0 ボタンOFF
 *  @reval 1 ボタンON
 */
int button_get (void)
{
    TRISAbits.TRISA4=1;
    return (PORTAbits.RA4 == 0);
}

