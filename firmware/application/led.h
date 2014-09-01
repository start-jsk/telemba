#ifndef __LED_H__
#define __LED_H__

#include "HardwareProfile.h"

void led_init (void);
void led_set (int ch, int data);
int led_get (int ch);

#endif /* __BUTTON_H__ */
