package com.hospital.healthhandwash;

import androidx.appcompat.app.AppCompatActivity;

import android.content.SharedPreferences;
import android.os.Bundle;
import androidx.annotation.NonNull;
import android.content.Intent;
import android.util.Log;
import android.util.Patterns;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.database.ValueEventListener;

public class LoginScreen extends AppCompatActivity implements View.OnClickListener,
        OnSuccessListener<AuthResult>, OnFailureListener
{
    private SharedPreferences sharedPref;
    private SharedPreferences.Editor editor;
    private FirebaseAuth auth;
    private FirebaseDatabase database;
    private DatabaseReference reference;
    private EditText et_loginEmail, et_loginPassword;
    private TextView tv_signupRedirectText;
    private Button btn_login;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.login_screen);

        this.init();
        this.btn_login.setOnClickListener(this);
        this.tv_signupRedirectText.setOnClickListener(this);

    }
    private void init()
    {
        // Shared preferences
        this.sharedPref = getSharedPreferences(String.valueOf(R.string.shared_pref_file_name),MODE_PRIVATE);
        this.editor = this.sharedPref.edit();
        // attributes
        this.et_loginEmail = findViewById(R.id.login_email);
        this.et_loginPassword = findViewById(R.id.login_password);
        this.btn_login = findViewById(R.id.login_button);
        this.tv_signupRedirectText = findViewById(R.id.signUpRedirectText);
        // insert login data
        String email = this.sharedPref.getString(String.valueOf(R.string.shared_pref_email), "");
        this.et_loginEmail.setText(email);
        // Firebase database
        this.auth = FirebaseAuth.getInstance();
        this.database = FirebaseDatabase.getInstance();
    }

    private void loginLogic()
    {
        String email = this.et_loginEmail.getText().toString();
        String pass = this.et_loginPassword.getText().toString();

        if ((!email.isEmpty()) &&
            (Patterns.EMAIL_ADDRESS.matcher(email).matches()))
        {
            if (!pass.isEmpty())
            {
                this.editor.putString(String.valueOf(R.string.shared_pref_email),email);
                this.auth.signInWithEmailAndPassword(email, pass)
                        .addOnSuccessListener(this)
                        .addOnFailureListener(this);
            }
            else
            {
                this.et_loginPassword.setError("Empty fields are not allowed");
            }
        }
        else if (email.isEmpty())
        {
            this.et_loginEmail.setError("Empty fields are not allowed");
        }
        else
        {
            this.et_loginEmail.setError("Please enter correct email");
        }
    }
    private void moveToSignUpScreen()
    {
        Intent login_page_intent = new Intent(LoginScreen.this,SignUpScreen.class);
        startActivity(login_page_intent);
        overridePendingTransition(R.anim.fade_in,R.anim.fade_out);
        finish();
    }

    private void moveToHomeScreen()
    {

        Intent login_page_intent = new Intent(LoginScreen.this,HomeScreen.class);
        startActivity(login_page_intent);
        overridePendingTransition(R.anim.fade_in,R.anim.fade_out);
        finish();
    }

    private String getUserUid()
    {
        FirebaseAuth auth = FirebaseAuth.getInstance();
        FirebaseUser firebaseUser = auth.getCurrentUser();

        if (firebaseUser != null)
        {
            String uid = firebaseUser.getUid();
            return uid;
        }

        return "";
    }

    private void addFirebaseUser() {
        String uid = getUserUid();

        DatabaseReference usersRef = this.database.getReference("users").child(uid);
        usersRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists())
                {
                    String username = dataSnapshot.child("username").getValue(String.class);
                    String profession = dataSnapshot.child("whatJob").getValue(String.class);
                    editor.putString(String.valueOf(R.string.shared_pref_profession), profession);
                    editor.commit();

                    if (username != null) {
                        // Now 'username' contains the username of the currently signed-in user.
                        UserFireBase user = new UserFireBase(uid, username);

                        // Add the user to the specified profession using the fetched username as the key
                        DatabaseReference professionRef = database.getReference(profession).child(user.getUid());
                        professionRef.setValue(user.getUsername());
                    }
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError databaseError) {}
        });
    }

    private void createFirebaseWHT()
    {
        String uid = getUserUid();

        this.reference = this.database.getReference("users").child(uid);

        String key = "handWashTimes";
        int HWT = 0;

        HandWashTimesFireBase HWTFB = new HandWashTimesFireBase(key, HWT);
        this.reference.child(HWTFB.getEmailName()).setValue(HWTFB.getHWT());
    }

    @Override
    public void onClick(View v)
    {
        if(v == this.tv_signupRedirectText)
        {
            this.moveToSignUpScreen();
        }
        if(v == this.btn_login)
        {
            Animation buttonLoginAnimation = AnimationUtils.loadAnimation(this, R.anim.fade_in);
            this.btn_login.startAnimation(buttonLoginAnimation);
            this.loginLogic();
        }
    }

    @Override
    public void onSuccess(AuthResult authResult)
    {
        Toast.makeText(LoginScreen.this, "Login Successful", Toast.LENGTH_SHORT).show();
        this.editor.putBoolean(String.valueOf(R.string.shared_pref_loggedin),true);// save logged in
        this.editor.putString(String.valueOf(R.string.shared_pref_user_uid), getUserUid()); // save user uid
        this.editor.apply();
        this.addFirebaseUser();
        this.createFirebaseWHT();

        this.moveToHomeScreen();
    }

    @Override
    public void onFailure(@NonNull Exception e)
    {
        Toast.makeText(LoginScreen.this, "Login Failed", Toast.LENGTH_SHORT).show();
    }

}