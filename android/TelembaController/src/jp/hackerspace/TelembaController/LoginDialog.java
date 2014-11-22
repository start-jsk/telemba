package jp.hackerspace.TelembaController;

import jp.hackerspace.TelembaController.R;
import android.app.Dialog;
import android.content.Context;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;

public class LoginDialog extends Dialog{

	private EditText usr, pwd ;
	private Button ok, ng ;
	private boolean isOk ;
		
	public LoginDialog(Context context, String user, String pass) {
		super(context);
		this.setContentView(R.layout.certification_dialog) ;
		
		this.setTitle("Login") ;
				
		this.usr = (EditText)this.findViewById(R.id.user_name) ;
		this.pwd = (EditText)this.findViewById(R.id.password) ;
		this.ok = (Button)this.findViewById(R.id.certification) ;
		this.ng = (Button)this.findViewById(R.id.cancel) ;
		this.isOk = false ;
		
		this.usr.setText(user) ;
		this.pwd.setText(pass) ;
		
		this.ok.setOnClickListener( new android.view.View.OnClickListener(){
			@Override
			public void onClick(View v) {
				LoginDialog.this.isOk = true ;
				LoginDialog.this.dismiss() ;
			}
		} ) ;
		
		this.ng.setOnClickListener( new android.view.View.OnClickListener(){
			@Override
			public void onClick(View v) {
				LoginDialog.this.isOk = false ;
				LoginDialog.this.dismiss() ;
			}
		} ) ;
	}
	
	public boolean isOK() {
		return this.isOk ;
	}
	
	public String getUserName() {
		if ( this.isOk ){
			return this.usr.getText().toString() ;
		} else {
			return "" ;
		}
	}
	
	public String getPassword() {
		if ( this.isOk ){
			return this.pwd.getText().toString() ;
		} else {
			return "" ;
		}
	}
}
