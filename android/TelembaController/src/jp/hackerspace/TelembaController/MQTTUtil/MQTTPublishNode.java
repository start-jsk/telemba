package jp.hackerspace.TelembaController.MQTTUtil;

import java.util.ArrayList;
import java.util.HashMap;

import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttPersistenceException;
import org.eclipse.paho.client.mqttv3.MqttTopic;

import android.util.Log;

public class MQTTPublishNode implements Runnable {
	
	private final static String TAG = "TelembaMQTTPublishNode" ;
	private MqttTopic topic ;
	private ArrayList<String> pubQueue ;
	private HashMap<String,String> idleHash ;
	private Thread thread ;
	private int maxQueue ;
	private int idleCnt ;
	
	private long lastPublish ;
	private long minSleep ;
	
	public MQTTPublishNode(){
		this.minSleep = 2000 ;
		this.lastPublish = System.currentTimeMillis() - this.minSleep ;
		this.pubQueue = new ArrayList<String>() ;
		this.idleHash = new HashMap<String,String>() ;
		// this.idleHash.put("default", "alive") ;
		this.idleCnt = -1 ;
		this.maxQueue = 10 ;
		this.thread = new Thread(this) ;
		this.thread.start() ;
	}
	
	public void enqueue(String tp){
		synchronized(this.pubQueue){
			this.pubQueue.add(tp);
			if (this.pubQueue.size() > this.maxQueue) {
				this.pubQueue.remove(0);
			}
		}
	}
	
	public void idleRegister(String tag, String val){
		synchronized(this.idleHash){
			this.idleHash.put(tag, val) ;
		}
	}
	
	public void setTopic(MqttTopic topic){
		this.topic = topic ;
	}

	public void onDestroy(){
		Log.d(TAG,"dead MQTTPublishNode") ;
		this.thread = null ;
	}

	public void publish (String tp){
		Log.d(TAG,"publish: " + tp) ;
		if ( this.topic != null ){
			try {
				this.topic.publish(tp.getBytes(), 1, false);
			} catch (MqttPersistenceException e) {
				e.printStackTrace();
			} catch (MqttException e) {
				e.printStackTrace();
			}
		} else {
			Log.d(TAG,"null topic") ;
		}
	}

	@Override
	public void run() {
		while ( this.thread != null ){
			if ( this.topic != null && this.pubQueue.size() > 0 ){
				String tp ;
				synchronized(this.pubQueue){
					tp = this.pubQueue.get(0) ;
					this.pubQueue.remove(0) ;
				}
				this.lastPublish = System.currentTimeMillis() ;
				this.publish(tp) ;
			} else if ( System.currentTimeMillis() - this.lastPublish > this.minSleep ){
				String tp = "idle";
				int i=-1 ;
				synchronized ( this.idleHash ){
					for (String key : this.idleHash.keySet()) {
						if (i < 0){
							this.idleCnt = (this.idleCnt + 1)
									% this.idleHash.size();
						}
						if (++i == this.idleCnt) {
							tp = this.idleHash.get(key);
							break;
						}
					}
				}
				this.publish(tp) ;
				this.lastPublish = System.currentTimeMillis() ;
			}
			try {
				Thread.sleep(500) ;
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}


}
