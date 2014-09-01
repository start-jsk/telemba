#ifndef __ROOMBA_H__
#define __ROOMBA_H__

/* roomba.c */
void timer1_enable(void);
void timer1_disable(void);
void roomba_set_comm_flag(void);
int roomba_get_sensor_count(void);
int roomba_set_sensor_count(int n);
void roomba_get_stream(char *buff, int size);
void roomba_init(void);
void roomba_update_recv(void);
void roomba_update_send(void);
int roomba_update(void);
void roomba_send_start(void);
void roomba_send_control(void);
void roomba_send_safe(void);
void roomba_send_clean(void);
void roomba_set_drive(short v, short r);
void roomba_send_drive(short v, short r);
int roomba_send_motors(int main_brush, int vacuum, int side_brush);
int roomba_send_stream(void);
/* -I/Users/tajima/roomba-telepresence/firmware/PIC24FJ64GB002-ADK */

#endif /* __ROOMBA_H__ */
