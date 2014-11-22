package jp.hackerspace.TelembaController;

import jp.hackerspace.TelembaController.MQTTUtil.MQTTPublishNode;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioManager;
import android.media.SoundPool;
import android.media.SoundPool.OnLoadCompleteListener;
import android.util.Log;

public class AndroidStatusReceiver extends BroadcastReceiver{
	
	private final static String TAG = "TelembaAndroidStatusReceiver" ;
	
	private float batteryPercent = 1.0f ;
	//for beep
    public SoundPool mSoundPool;
    public int mSoundID;
    public int sound_check=1;//play beep when it changes from 1 to 0
    public int isLoaded=0;//this value tuens to 1 when sound is loaded
	private MQTTPublishNode pubNode ;

    public AndroidStatusReceiver(){
		// sound test
		mSoundPool = new SoundPool(1, AudioManager.STREAM_MUSIC, 0);
		mSoundPool.setOnLoadCompleteListener(new OnLoadCompleteListener() {
			@Override
			public void onLoadComplete(SoundPool soundPool, int sampleId,
					int status) {
				if (0 == status) {
					isLoaded = 1;
				}
			}
		});
		mSoundID = mSoundPool.load(TelembaActivity.getActivity(), R.raw.sample, 1);

    }
    
	public void setMQTTClient(MQTTPublishNode n ){
		this.pubNode = n ;
	}
    
    public void onDestroy(){
		if ( mSoundPool != null ) { mSoundPool.release(); }
    }
	
	@Override
	public void onReceive(Context context, Intent intent) {
		int scale, level ;
		if (intent.getAction().equals(Intent.ACTION_BATTERY_CHANGED)) {
			// 電池残量の最大値
			scale = intent.getIntExtra("scale", 0);
			// 電池残量
			level = intent.getIntExtra("level", 0);
		} else {
			return ;
		}
		if ( scale == 0 )	scale = 1 ;
		this.batteryPercent = 1.0f * level / scale ;
		Log.d(TAG, "battery changed "+this.batteryPercent+" "+sound_check);
		if((double)level/(double)scale>0.2){
			sound_check=1;
		}
		if(this.batteryPercent<=0.2 && sound_check==1 && isLoaded==1){
			mSoundPool.play(mSoundID, 1.0f, 1.0f, 0, 0, 1.0f);
			sound_check=0;
		}

		if ( this.pubNode != null ){
			String tp = "android_battery " + Math.round(100f*this.batteryPercent);
			this.pubNode.enqueue(tp) ;
			this.pubNode.idleRegister("android_battery", tp) ;
		}
		
		//結果を描写
		TelembaActivity.textPost(R.id.android_battery_content, "" + level
				+ "/" + scale) ;
		
	}
}
