package jp.hackerspace.TelembaController.MQTTUtil;

import jp.hackerspace.TelembaController.R;
import jp.hackerspace.TelembaController.TelembaActivity;
import jp.hackerspace.TelembaController.USBUtil.RoombaCommand;
import jp.hackerspace.TelembaController.USBUtil.USB2Roomba;
import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.content.ContextWrapper;
import android.util.Log;

import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.MqttTopic;

public class MQTTCallback implements MqttCallback {

	final private String TAG = "MQTTCallback";

	private ContextWrapper context;
	private USB2Roomba usb2roomba;
	private Runnable reconnectThread;

	public MQTTCallback(ContextWrapper context, USB2Roomba usb2roomba,
			Runnable reconnectThread) {
		this.context = context;
		this.usb2roomba = usb2roomba;
		this.reconnectThread = reconnectThread;
	}

	@Override
	public void connectionLost(Throwable cause) {
		Log.d(TAG, "connectionLost: " + cause.getMessage());
		TelembaActivity.textPost(R.id.network_content, "lost connection");
		if (this.reconnectThread == null) {
			TelembaActivity.toastPost("lost connection", true);
		} else {
			TelembaActivity.toastPost("lost connection", false);
			new Thread(this.reconnectThread).start();
		}
	}

	@Override
	public void messageArrived(MqttTopic topic, MqttMessage message) {

		try {
			final NotificationManager notificationManager = (NotificationManager) context
					.getSystemService(Context.NOTIFICATION_SERVICE);

			// final Notification notification = new
			// Notification(R.drawable.snow,
			// "Black Ice Warning!", System.currentTimeMillis());
			final Notification notification = new Notification();

			Log.d(TAG, "recieve message:" + new String(message.getPayload()));

			final String mesg = new String(message.getPayload());
			if (mesg.startsWith("drive")) {
				String array[] = mesg.split(" ");
				Log.d("Roombox", "mesg:" + array[0] + " " + array[1] + " "
						+ array[2]);
				this.usb2roomba.roombaSend(RoombaCommand.drive(
						Integer.valueOf(array[1]), Integer.valueOf(array[2])));
			} else {
				if (mesg.equals("init")) {
					Log.d(TAG, "init");
					this.usb2roomba.roombaSend(RoombaCommand.start());
					this.usb2roomba.roombaSend(RoombaCommand.control());
				} else if (mesg.equals("clean")) {
					this.usb2roomba.roombaSend(RoombaCommand.clean());
				} else if (mesg.equals("fwd")) {
					Log.d(TAG, "fwd");
					this.usb2roomba.roombaSend(RoombaCommand.drive(100, 0));
					Thread.sleep(300);
				} else if (mesg.equals("bkw")) {
					Log.d(TAG, "bak");
					this.usb2roomba.roombaSend(RoombaCommand.drive(-100, 0));
				} else if (mesg.equals("left")) {
					Log.d(TAG, "left");
					this.usb2roomba.roombaSend(RoombaCommand.drive(100, 1));
				} else if (mesg.equals("right")) {
					Log.d(TAG, "right");
					this.usb2roomba.roombaSend(RoombaCommand.drive(100, -1));
				} else if (mesg.startsWith("invite")) {
					String array[] = mesg.split(" ");
					TelembaActivity.startHangout(array[1]);
				} else if (mesg.startsWith("motors")) {
					String array[] = mesg.split(" ");
					this.usb2roomba.roombaSend(RoombaCommand.motors(
							Integer.valueOf(array[1]),
							Integer.valueOf(array[2]),
							Integer.valueOf(array[3])));
				} else if (mesg.startsWith("servo")) {
					String array[] = mesg.split(" ");
					this.usb2roomba.roombaSend(RoombaCommand.servo(Integer
							.valueOf(array[1])));
				}
				Thread.sleep(500);
				this.usb2roomba.roombaSend(RoombaCommand.drive(0, 0));
			}

			TelembaActivity.textPost(R.id.network_content, mesg.toUpperCase());

			// Hide the notification after its selected
			notification.flags |= Notification.FLAG_AUTO_CANCEL;
			notification.number += 1;
			notificationManager.notify(0, notification);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Override
	public void deliveryComplete(MqttDeliveryToken token) {
		// We do not need this because we do not publish
	}
}
