package jp.hackerspace.TelembaController;

import jp.hackerspace.TelembaController.R;
import jp.hackerspace.TelembaController.MQTTUtil.MQTTCallback;
import jp.hackerspace.TelembaController.MQTTUtil.MQTTPublishNode;
import jp.hackerspace.TelembaController.USBUtil.RoombaCommand;
import jp.hackerspace.TelembaController.USBUtil.USB2Roomba;
import jp.hackerspace.TelembaController.USBUtil.USBAccessoryManagerMessage;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttTopic;
import org.eclipse.paho.client.mqttv3.internal.MemoryPersistence;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Binder;
import android.os.IBinder;
import android.os.Message;
import android.util.Log;
import android.app.IntentService;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;

public class MQTTClientService extends IntentService implements Runnable {

	private String TAG = "TelembaIntentService";

	private final IBinder binder = new RoomBoxIntentServiceBinder();
    private AndroidStatusReceiver androidStatusReceiver ;

	private MqttClient client;
	private String brokerUrl;
	private MqttConnectOptions conOpt;
	public static final int Connect = 1;
	public static final int RoombaCmd = 2;

	public static Boolean running = false;
	public int cnt = 0;
	private USB2Roomba usb2roomba;
	private MqttTopic topic ;

	private Notification n = new Notification(); // Notificationの生成
	private NotificationManager nm;

	private String usr, pwd;
	private boolean login;
	
	private MQTTPublishNode pubNode ;
	
	public MQTTClientService(String name) {
		super(name);
		
		Log.d(TAG, "Constructer");

		this.pubNode = new MQTTPublishNode() ;
		this.brokerUrl = "tcp://telemba.jp:1883";

		Log.d(TAG, "roomba check");
		TelembaActivity.timer = Long.MAX_VALUE ;
		this.usb2roomba = new USB2Roomba(TelembaActivity.getActivity()) ;
		this.usb2roomba.setMQTTClient(this.pubNode);
		if (! this.usb2roomba.connect()) {
			TelembaActivity.toastPost("Roomba missing", true) ;
			return ;
		}
		
		try {
			conOpt = new MqttConnectOptions();
			conOpt.setCleanSession(false);
			client = new MqttClient(this.brokerUrl, "RoomboxTest",
					new MemoryPersistence());

			client.setCallback(new MQTTCallback(this, this.usb2roomba,this));
		} catch (MqttException e) {
			Log.d(TAG, "Unable to set up client: " + e.toString());
			Log.d(TAG, "cause: " + e.getCause());
			Log.d(TAG, "exception: " + e.getLocalizedMessage());
		}
	}

	public MQTTClientService() {
		this("RoomBoxIntentService");
	}

	// mothod for notification
	private void sendNotification() {

		n.icon = R.drawable.ic_launcher; // アイコンの設定
		n.tickerText = "Roombox"; // メッセージの設定
		// 通知がスライドで消えないようにする
		n.flags = Notification.FLAG_ONGOING_EVENT;
		// Intent i = new Intent(getApplicationContext(),
		// NotificationActivity.class);
		Intent i = new Intent(this, TelembaActivity.class);
		i.setAction(Intent.ACTION_MAIN);
		PendingIntent pi = PendingIntent.getActivity(this, 0, i, 0);
		n.setLatestEventInfo(this, "Telemba Controller Service is running",
				"Tap to go back to Telemba Controller", pi);

		nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
		nm.notify(1, n); // 設定したNotificationを通知する
	}

	public void show_notification() {
		sendNotification();
	}

	public void stop_notification() {// private may be better
		if ( nm != null ) nm.cancel(1);
	}

	@Override
	public IBinder onBind(Intent intent) {
		Log.d(TAG, "onBind");
		return binder;
	}

	@Override
	public boolean onUnbind(Intent intent) {
		Log.d(TAG, "onUnbind");
		running = false;
		return true;

	}
	
	public boolean connectServer() {
		if ( client.isConnected() ) {
			Log.d(TAG, "connectServer: already connected") ;
			return true ;
		}
		try {
			if (login) {
				conOpt.setUserName(usr);
				// use no password connection
				// conOpt.setPassword(pwd.toCharArray());
				client.connect(conOpt);
				TelembaActivity.textPost(R.id.user_name_content, usr);
			} else {
				client.connect();
			}
			Log.d(TAG, "usr:" + usr + " pwd:" + pwd);
		} catch (MqttException e) {
			Log.d(TAG, "connect failed");
			//TelembaActivity.toastPost("authentication failure", true);
			return false;
		}

		long timer = 2000 ;
		while (!client.isConnected() && timer > 0) {
			Log.d(TAG, "connectServer: wait connection");
			timer -= 500 ;
			try {
				Thread.sleep(500);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		
		if (!client.isConnected()) {
			Log.d(TAG, "connectServer: connection failure");
			//TelembaActivity.toastPost("authentication failure", true);
			return false ;
		} else {
			Log.d(TAG, "connectServer: connection succeeded");
			return true ;
		}
	}

	@Override
	protected void onHandleIntent(Intent intent) {
		Log.d(TAG, "call onHandleIntent " + cnt++);
		
		if ( this.androidStatusReceiver == null ){
			this.androidStatusReceiver = new AndroidStatusReceiver();
			this.androidStatusReceiver.setMQTTClient(this.pubNode);
			IntentFilter battery_filter = new IntentFilter();
			battery_filter.addAction(Intent.ACTION_BATTERY_CHANGED);
			registerReceiver(androidStatusReceiver, battery_filter);
		}

		this.usr = intent.getStringExtra("usr");
		this.pwd = intent.getStringExtra("pwd");
		this.login = (usr != null && usr.length() > 0 && pwd != null && pwd
				.length() > 0);

		if ( ! connectServer() ){
			TelembaActivity.toastPost("authentication failure", true);
			return ;
		} else {
			TelembaActivity.textPost(R.id.network_content, "mqtt authorized");
		}

		String topicName = "/telemba/" + usr ;
		int qos = 1;
		this.topic = this.client.getTopic(topicName + "/data") ;
		this.pubNode.setTopic(this.topic) ;
		//this.usb2roomba.setClient(this.topic);
		try {
			this.client.subscribe(topicName + "/command", qos);
		} catch (MqttException e) {
		}

		long time_step = 300 ;
		long sleep_time ;
		long silence_timer ;
		ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
		NetworkInfo nInfo = cm.getActiveNetworkInfo();
		boolean network_connect = false;
		boolean roomba_connect = false;
		while (MQTTClientService.running != null && MQTTClientService.running) {
			try {
				TelembaActivity.timer = System.currentTimeMillis() ; // start
				
				// network check ;
				if ( nInfo == null || cm == null ){
					cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
					nInfo = cm.getActiveNetworkInfo();
				}
				network_connect = nInfo!=null && nInfo.isConnected() ;
				
				// roomba receive observer
				silence_timer = TelembaActivity.timer - this.usb2roomba.getLastReceiveTime();
				if ( silence_timer > 3000){
					Log.d(TAG, "roomba missing reconnect");
					this.usb2roomba.onDestroy();
					this.usb2roomba = new USB2Roomba(TelembaActivity.getActivity()) ;
					this.usb2roomba.setMQTTClient(this.pubNode);
					if (! this.usb2roomba.connect()) {
						Log.d(TAG, "roomba missing reconnect failed");
						TelembaActivity.toastPost("Roomba missing", true) ;
					}
				} else if (silence_timer > 2000){
					Log.d(TAG, "roomba missing");
					this.usb2roomba.onDestroy();
					roomba_connect = false ;
					TelembaActivity.textPost(R.id.status_content, "Missing...") ;
					TelembaActivity.textPost(R.id.bumper_content, "-") ;
					TelembaActivity.textPost(R.id.roomba_battery_content, "" + "-") ;
				} else {
					roomba_connect = true ;
				}
				
				// roomba send observer
				silence_timer = TelembaActivity.timer - this.usb2roomba.getLastSendTime() ;
				if ( silence_timer > time_step && network_connect ) { //(network_connect = nInfo!=null && nInfo.isConnected()) ){
					Log.d(TAG, "send zero velocity to roomba");
					this.usb2roomba.roombaSend( RoombaCommand.drive(0, 0), time_step) ;
				}
				
				// log
				if ( (sleep_time = (time_step - System.currentTimeMillis() + TelembaActivity.timer )) <= 0 ){
					Log.d(TAG, "onHandleIntent overslept " + sleep_time);
				} else {
					if ( ((TelembaActivity.timer/time_step) % (1000/time_step)) == 0 ){
						Log.d(TAG, "onHandleIntent Log network=" + network_connect + " roomba_connect=" + roomba_connect);
					}
					Thread.sleep(sleep_time);
				}
				
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}

		//this.onDestroy(); // stop but not restart
	}

	@Override
	public void onDestroy() {
		Log.d(TAG, "onDestory");
		/* 通知の終了 */
		this.usb2roomba.onDestroy();
		this.stop_notification();
		super.onDestroy();
		// running = false;

		Message msg = Message.obtain();
		msg.what = Connect;
		msg.obj = USBAccessoryManagerMessage.MessageType.DISCONNECTED;

		// Disconnect the client
		try {
			if ( this.client != null ) this.client.disconnect();
		} catch (MqttException e) {
			Log.d(TAG, "disconnect failed");
		} finally {
			MQTTClientService.running = null;
		}
		
		if ( this.androidStatusReceiver != null ){
			this.unregisterReceiver(this.androidStatusReceiver) ;
			this.androidStatusReceiver = null ;
		}
		
		if ( this.pubNode != null ){
			this.pubNode.onDestroy() ;
			this.pubNode = null ;
		}
	}

	public class RoomBoxIntentServiceBinder extends Binder {
		MQTTClientService getService() {
			return MQTTClientService.this;
		}
	}

	@Override
	public void run() {
		long timer = 60 * 1000;
		long step = 1000;
		while ( timer > 0 ){
			if ( MQTTClientService.running == null || !MQTTClientService.running ){
				return ;
			}
			TelembaActivity.textPost(R.id.network_content, "lost connection " + (timer/1000) + "sec");
			ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
			NetworkInfo nInfo = cm.getActiveNetworkInfo();
			if ( nInfo!=null && nInfo.isConnected() ){
				TelembaActivity.textPost(R.id.network_content, "network connect " + (timer/1000) + "sec");
				if ( connectServer() ){
					TelembaActivity.textPost(R.id.network_content, "mqtt authorized");
					return ;
				}
			}
			try {
				Thread.sleep(step) ;
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			timer -= step ;
		}
		TelembaActivity.toastPost("reconnect failed", true);
	}

}