package jp.hackerspace.TelembaController.USBUtil;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

public class RoombaCommand {
	public static final int START = 128;
	public static final int BAUD = 129;
	public static final int CONTROL = 130; // 0
	public static final int SAFE = 131; // 0
	public static final int FULL = 132; // 0
	public static final int POWER = 133; // 0
	public static final int CLEAN = 135;
	public static final int DRIVE = 137;
	public static final int MOTORS = 138; // ブラシなどのモータON/OFF
	public static final int STREAM = 148;
	public static final int SERVO = 180; // ラジコンサーボ用拡張

	public static byte[] start() {
		byte[] buff = new byte[1];
		buff[0] = (byte) START;
		return buff;
	}

	public static byte[] control() {
		byte[] buff = new byte[1];
		buff[0] = (byte) CONTROL;
		return buff;
	}

	public static byte[] stop() {
		byte[] buff = new byte[1];
		buff[0] = (byte) SAFE;
		return buff;
	}

	public static byte[] clean() {
		byte[] buff = new byte[1];
		buff[0] = (byte) CLEAN;
		return buff;
	}
	public static byte[] drive(final int vel, final int rad) {
		byte[] cmd = new byte[5];
		ByteBuffer buf = ByteBuffer.wrap(cmd);
		buf.order(ByteOrder.BIG_ENDIAN);
		buf.put((byte) DRIVE);
		buf.putShort((short) vel);
		buf.putShort((short) rad);
		return cmd;
	}
	/**
	 * @brief モータのON/OFF (ON=1, OFF=0)
	 * @param side_brush サイドブラシ 
	 * @param side_brush 吸引
	 * @param side_brush メインブラシ
	 */
	public static byte[] motors (final int side_brush, final int vacuum, final int main_brush) {
		byte[] cmd = new byte[2];
		ByteBuffer buf = ByteBuffer.wrap(cmd);
		buf.order(ByteOrder.BIG_ENDIAN);
		buf.put((byte) MOTORS);
		buf.put((byte) ( (main_brush << 2) & (vacuum << 1) & side_brush));
		return cmd;
	}
	/**
	 * @brief RCサーボの位置の設定
	 * @param pwm PWM幅 [us]
	 */
	public static byte[] servo (final int pwm) {
		byte[] cmd = new byte[3];
		ByteBuffer buf = ByteBuffer.wrap(cmd);
		buf.order(ByteOrder.BIG_ENDIAN);
		buf.put((byte) SERVO);
		buf.putShort((short) pwm);
		return cmd;
	}
	public static byte[] stream () {
		byte[] cmd = new byte[3];
		ByteBuffer buf = ByteBuffer.wrap(cmd);
		buf.order(ByteOrder.BIG_ENDIAN);
		buf.put((byte) STREAM);
		buf.put((byte) 1);
		buf.put((byte) 0);
		return cmd;
	}
}
