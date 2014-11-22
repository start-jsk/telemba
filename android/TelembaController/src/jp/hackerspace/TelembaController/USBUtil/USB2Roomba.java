package jp.hackerspace.TelembaController.USBUtil;

import jp.hackerspace.TelembaController.R;
import jp.hackerspace.TelembaController.TelembaActivity;
import jp.hackerspace.TelembaController.MQTTUtil.MQTTPublishNode;
import jp.hackerspace.TelembaController.USBUtil.USBAccessoryManager.RETURN_CODES;
import android.content.Context;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

public class USB2Roomba{

	private String TAG = "USB2Telemba";
	
//	private MqttTopic topic;
	private USBAccessoryManager accessoryManager;
	private Handler usbHandler;
	private Context context ;
	private final static int USBAccessoryWhat = 0;
	public static final int APP_CONNECT = (int) 0xFE; //
	public static final int APP_DISCONNECT = (int) 0xFF; //
	public RoombaCommand roomba = new RoombaCommand();
	private MQTTPublishNode pubNode ;
	
	private String bump = "-1";
	private String prev_bump ;
	
	private String bttry = "0";
	private String prev_bttry  ;
	public static String android_battery = "0";
	public static String prev_android_battery;

	private Long lastReceiveTime ;
	private Long lastSendTime ;
	
	public USB2Roomba(Context con){
		this.context = con ;
		
		this.lastReceiveTime = System.currentTimeMillis() ;
		this.lastSendTime = this.lastReceiveTime ;
		this.usbHandler = new Handler() {
			@Override
			public void handleMessage(Message msg) {
				synchronized ( USB2Roomba.this.lastReceiveTime ){
					USB2Roomba.this.lastReceiveTime = System
							.currentTimeMillis();
					switch (msg.what) {
					case USBAccessoryWhat:
						switch (((USBAccessoryManagerMessage) msg.obj).type) {
						case READ:
							/* 15msおきにセンサデータ(Group6)がくる */
							/* サイズは全体で56バイト */
							/* header + size + id + data[52] + checksum */
							byte[] sensorPacket = new byte[64];
							accessoryManager.read(sensorPacket);

							/* 各センサ情報については、ROI仕様書の35ページ参照 */
							/* たとえばバンパセンサはdataの1バイトめ */
							String bump = Integer
									.toHexString(sensorPacket[2 + 1] & 0xff);
							Log.d(TAG, "BUMP:" + bump);
							/* バッテリー残量はdataの23,24バイトめ[mAh] */
							final short charge = (short) ((sensorPacket[2 + 23] << 8) + sensorPacket[2 + 24]);
							Log.d(TAG, "CHARGE:" + charge);
							/* バッテリー容量はdataの25,26バイトめ[mAh] */
							final short capacity = (short) ((sensorPacket[2 + 25] << 8) + sensorPacket[2 + 26]);
							Log.d(TAG, "CAPACITY:" + capacity);
							// change UI
							TelembaActivity.textPost(R.id.status_content,
									"Device connected.");
							TelembaActivity.textPost(R.id.bumper_content, bump);
							TelembaActivity.textPost(
									R.id.roomba_battery_content, "" + charge
											+ "/" + capacity);

							//
							if (USB2Roomba.this.pubNode != null) {
								USB2Roomba.this.prev_bump = USB2Roomba.this.bump;
								USB2Roomba.this.bump = bump;
								USB2Roomba.this.prev_bttry = USB2Roomba.this.bttry;
								USB2Roomba.this.bttry = ""
										+ ((capacity == 0) ? 0 : charge * 100
												/ capacity);
								USB2Roomba.this.enqueue();
							}
							// TelembaActivity.textPost(R.id.status_content,
							// "Device connected.") ;

							break;
						case READY:
							Log.d(TAG, "READY");
							byte[] sndData = new byte[1];
							sndData[0] = (byte) APP_CONNECT; //
							if (accessoryManager.isConnected()) {
								accessoryManager.write(sndData);
							} else {
								Log.d(TAG, "close usb connection?");
							}
							TelembaActivity.textPost(R.id.status_content,
									"Device connected.");

							break;
						case DISCONNECTED:
							Log.d(TAG, "DISCONNECTED");
							// TelembaActivity.textPost(R.id.status_content,
							// "Device disconnected.") ;
							// TelembaActivity.toastPost("roomba missing", true)
							// ;
							break;
						/*
						 * case STOP: Log.d(TAG, "DISCONNECTED");
						 */
						default:
							Log.d(TAG, "Unknow callback " + USBAccessoryWhat);
							break;
						}
						break;
					default:
						break;
					}
				}
			}
		};
		accessoryManager = new USBAccessoryManager(usbHandler, USBAccessoryWhat);
		//this.roombaSend(RoombaCommand.start()) ;
	}
	
	public long getLastReceiveTime(){
		synchronized(this.lastReceiveTime){
			return this.lastReceiveTime ;
		}
	}
	
	public long getLastSendTime(){
		synchronized(this.lastSendTime){
			return this.lastSendTime ;
		}
	}
	
	private void enqueue(){
		if ( this.pubNode == null ) return ;
		if (!this.bump.contentEquals(this.prev_bump)) {
			this.pubNode.enqueue("bump " + this.bump);
		}
		if (!this.bttry.contentEquals(this.prev_bttry)){
			String tp = "battery " + this.bttry ;
			this.pubNode.enqueue(tp);
			this.pubNode.idleRegister("battery", tp) ;
		}
	}
	
	public void setMQTTClient(MQTTPublishNode n ){
		this.pubNode = n ;
	}
	
	public boolean connect(){
		return this.context != null && accessoryManager.enable(this.context) == RETURN_CODES.SUCCESS ;
	}
	
//	public void setClient(MqttTopic client){
//		this.topic = client ;
//	}
	
	public void onDestroy(){
		Log.d(TAG,"call onDestroy for USB2Roomba" ) ;
		if ( this.accessoryManager == null ){
			Log.d(TAG," onDestroy failed" ) ;
			return ;
		}
		
		byte[] sndData = new byte[1];
		sndData[0] = (byte) APP_DISCONNECT;
		if ( this.accessoryManager.isConnected()) {
			Log.d(TAG," write roomba disconnect message") ;
			this.accessoryManager.write(sndData);
		} else {
			Log.d(TAG," !! could not write roomba disconnect message") ;
		}
		
		this.accessoryManager.disable(this.context);
		try {
			long max = 2000 ;
			long step = 400 ;
			long tm = 0;
			while ( !this.accessoryManager.isClosed()  && tm < max) {
				tm += step ;
				Thread.sleep(step);
				Log.d(TAG,"wait for accesory close " + tm + "/" + max ) ;
			}
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		if ( this.accessoryManager.isClosed() ){
			Log.d(TAG,"accesory closed") ;
		} else {
			Log.d(TAG,"accesory closed?") ;
		}
	}
	
	
	public void roombaSend(final byte[] buff) {
		roombaSend(buff,0);
	}
	
	public void roombaSend(final byte[] buff, long min) {
		synchronized (this.lastSendTime) {
			if ( System.currentTimeMillis() - this.lastSendTime < min ){
				Log.d(TAG, "skip mintime " + min);
				return ;
			}
			this.lastSendTime = System.currentTimeMillis();
			usbHandler.post(new Runnable() {
				@Override
				public void run() {
					// Log.d(TAG, "write");
					accessoryManager.write(buff);
				}
			});
		}
	}
}
