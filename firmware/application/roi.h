#ifndef __ROI_H__
#define __ROI_H__

#ifdef __cplusplus
extern "C" {
#endif

    typedef unsigned char   ubyte_t;
    typedef unsigned short  uword_t;
    typedef unsigned long   ulong_t;

/**
 *  ROIコマンド一覧
 */
#define ROICMD_START (128)
#define ROICMD_BAUD  (129)
#define ROICMD_CONTROL  (130)
#define     ROICMD_SAFE     (131)
#define     ROICMD_FULL     (132)
#define     ROICMD_POWER    (133)
#define     ROICMD_SPOT     (134)
#define     ROICMD_CLEAN    (135)
#define     ROICMD_MAX      (136)
#define     ROICMD_DOCK     (143)
#define     ROICMD_DRIVE    (137)
#define     ROICMD_MOTORS   (138)
#define     ROICMD_LEDS     (139)
#define     ROICMD_SONG     (140)
#define     ROICMD_PLAY     (141)
#define     ROICMD_SENSORS  (142)
#define     ROICMD_STREAM      (148)
#define     ROICMD_QUERY_LIST  (149)
#define     ROICMD_PAUSE_RESUME_STREAM  (150)

#define ROICMD_SERVO (180)

#define ROI_LEDS_STATUS_OK  (0x20)
#define ROI_LEDS_STATUS_NG  (0x10)
#define ROI_LEDS_SPOT       (0x08)
#define ROI_LEDS_CLEAN      (0x04)
#define ROI_LEDS_MAX        (0x02)
#define ROI_LEDS_DIRT       (0x01)

/* roi.c */
int roi_set_clean(unsigned char *buff);
int roi_set_start(unsigned char *buff);
int roi_set_baud(unsigned char *buff, int baud);
int roi_set_control(unsigned char *buff);
int roi_set_safe(char *buff);
int roi_set_power(char *buff);
int roi_set_drive(char *buff, short v, short r);
int roi_get_drive(char *buff, short *pos_vel, short *radius);
int roi_get_motors(char *buff, int *side_brush, int *vacuum, int *main_brush);
int roi_get_servo(char *buff, short *pwm_ref);
int roi_set_leds(char *buff, unsigned char leds, unsigned char power_color, unsigned char power_intensity);
int roi_set_stream(char *buff, int id);
int roi_set_stream_response_header(char *buff, unsigned char data);
int roi_set_stream_response_size(char *buff, unsigned char c);
int roi_get_stream_response_size(char *buff);
int roi_set_stream_response_data(char *buff, unsigned int no, char data);
int roi_check_stream_response(char *buff);
int roi_get_stream_response_bump_r(char *buff);
int roi_get_stream_response_bump_l(char *buff);
int roi_get_sensor_response_bump_r(char *buff);
int roi_get_sensor_response_bump_l(char *buff);
char *scan_octave(char *arg, int *octave);
char *scan_rest(char *arg, int *length);
char *scan_note(char *arg, int *note, int *length);
int roi_song(unsigned char *buff, unsigned char no, char *args);
int roi_song2(char *buff);
int roi_set_play(unsigned char *buff, unsigned char no);
int roi_set_sensor(char *buff, unsigned char packet_id);
int roi_set_query_list(char *buff, unsigned char numb, unsigned char packet_id_list[]);
int roi_get_query_list_response_size(unsigned char numb, unsigned char packet_id_list[]);
int roi_set_query_list_response(char buff, unsigned char numb, unsigned char packet_id_list[]);
int roi_set_motors(char *buff, int main_brush, int vacuum, int side_brush);
/* -I/Users/tajima/roomba-telepresence/firmware/PIC24FJ64GB002-ADK */

#ifdef __cplusplus
}
#endif

#endif /* __ROI_H__ */
