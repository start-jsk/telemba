package jp.hackerspace.TelembaController;

import android.app.Activity;
import android.content.ComponentName;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.content.DialogInterface.OnDismissListener;
import android.content.Intent;
import android.content.ServiceConnection;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.view.KeyEvent;
import android.widget.Toast;
import android.content.Context;
import android.widget.TextView;

public class TelembaActivity extends Activity {
	final static private String TAG = "TelembaActivity";

	private static Activity showActivity;
	private MQTTClientService roomboxIntentService;
	private ConnectivityManager cm  ;
	
	//public static USB2Roomba usb2roomba ;
	public static long timer ;
	
    private ServiceConnection serviceConnection ;
    
	private SharedPreferences pref;
	private SharedPreferences.Editor editor;
	
	final private static String dbname = "TelembaLogin" ;
	final private static String dbtag_user = "username" ;
	final private static String dbtag_pass = "userpass" ;
	
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		showActivity=this;
		
		Log.d(TAG, "onCreate");
		
		if ( MQTTClientService.running != null && MQTTClientService.running ){
			System.out.println( "zombie detected" ) ;
			TelembaActivity.toastPost(null, true) ;
			return ;
		}
		
		// online check
		Log.d(TAG, "online check");
		cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
		NetworkInfo nInfo = cm.getActiveNetworkInfo();
		if ( nInfo!=null && nInfo.isConnected() ){
			((TextView)findViewById(R.id.network_content)).setText("YES") ;
		} else {
			TelembaActivity.toastPost("network missing", true) ;
			return ;
		}
		
		MQTTClientService.running = true ;
		this.serviceConnection = new MQTTServiceConnection() ;
		
		Log.d(TAG, "bind Intent");
		// RoomBoxIntentServiceをバインド
		final Intent intent = new Intent(getBaseContext(), MQTTClientService.class);
		intent.setAction("android.hardware.usb.action.USB_ACCESSORY_ATTACHED");
		bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE);
		
		pref = getSharedPreferences(TelembaActivity.dbname, Activity.MODE_PRIVATE);
		
		// login
		final LoginDialog ld = new LoginDialog(this, pref.getString(
				TelembaActivity.dbtag_user, ""), pref.getString(
				TelembaActivity.dbtag_pass, ""));
		ld.setOnDismissListener(new OnDismissListener() {
			@Override
			public void onDismiss(DialogInterface dialog) {
				new Thread(new Runnable() {
					@Override
					public void run() {
						// start intent
						if (ld.isOK()) {
							intent.putExtra("usr", ld.getUserName());
							intent.putExtra("pwd", ld.getPassword());
							
							editor = pref.edit();
							editor.putString(TelembaActivity.dbtag_user, ld.getUserName()) ;
							editor.putString(TelembaActivity.dbtag_pass, ld.getPassword()) ;
							editor.commit() ;
						}
						startService(intent);
						long timer = 3000;
						while (roomboxIntentService == null && timer > 0) {
							System.out.println("[INTENT WAIT] " + timer) ;
							timer -= 500 ;
							try {
								Thread.sleep(500);
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
						}
						if ( roomboxIntentService == null ){
							TelembaActivity.toastPost("service connection error", true) ;
						} else {
							System.out.println("service connected");
							roomboxIntentService.show_notification();
						}
					}
				}).start();
			}
		});
		Log.d(TAG, "dialog show") ;
		ld.show();
 
	}

	@Override
	public void onStart() {
		super.onStart();
//		this.setTitle("Device not connected.");
	}

	@Override
	public void onResume() {
		super.onResume();
	}

	@Override
	public void onPause() {
		super.onPause();
	}

	@Override
	public void onDestroy() {
		super.onDestroy();
		if ( this.serviceConnection != null ){
			this.unbindService(this.serviceConnection) ;
			this.serviceConnection = null ;
		}
		MQTTClientService.running = false ;
	}
	
	public static Activity getActivity(){
		return showActivity ;
	}
	
	public static void uiPost(Runnable run){
		showActivity.runOnUiThread(run) ;
	}
	
	public static void textPost(int id, final String mes){
		final TextView tv = (TextView) TelembaActivity.showActivity
				.findViewById(id);
		TelembaActivity.uiPost(new Runnable() {
			@Override
			public void run() {
				tv.setText(mes);
			}
		});
	}
	
	public static void toastPost(final String mes, final boolean finish){
		if ( mes != null ){
			TelembaActivity.uiPost(new Runnable() {
				@Override
				public void run() {
					Toast.makeText(TelembaActivity.showActivity, mes,
							Toast.LENGTH_LONG).show();
				}
			});
		}
		if ( finish ){
			Log.d( TAG, "kill MQTT client" ) ;
			MQTTClientService.running = false ;
			long timer = 3000 ;
			while ( MQTTClientService.running != null && timer > 0 ){
				try {
					Thread.sleep(500) ;
					timer -= 500 ;
					Log.d( TAG, "wait MQTT dead while " + timer + " > 0" ) ;
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
			Log.d( TAG, "finish activity" ) ;
			TelembaActivity.uiPost(new Runnable() {
				@Override
				public void run() {
					TelembaActivity.showActivity.finish();
				}
			});
		}
	}
	
	public static void startHangout(final String url){
		Intent sky = new Intent("android.intent.action.VIEW",
				Uri.parse(url));
		sky.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		TelembaActivity.showActivity.startActivity(sky);
	}

	/**
	 * 通信終了処理	 */
	public void disconnectAccessory() {
		Log.d(TAG, "disconnectAccessory()");
		setTitle("Device not connected.");
	}

	class MQTTServiceConnection implements ServiceConnection{
		@Override
		public void onServiceConnected(ComponentName name, IBinder service) {
			Log.d(TAG, "onServiceConnected");
			roomboxIntentService = ((MQTTClientService.RoomBoxIntentServiceBinder) service)
					.getService();
		}
		@Override
		public void onServiceDisconnected(ComponentName name) {
			Log.d(TAG, "onServiceDisconnected");
			MQTTClientService.running = false ;
			roomboxIntentService = null;
		}
	};
	
	@Override
	public boolean dispatchKeyEvent(KeyEvent event) {
	    if (event.getAction()==KeyEvent.ACTION_DOWN) {
	        switch (event.getKeyCode()) {
	        case KeyEvent.KEYCODE_BACK:
	        	TelembaActivity.toastPost("Disabled", false) ;
	            return true;
	        }
	    }
	    return super.dispatchKeyEvent(event);
	}
	
}