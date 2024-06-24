package com.hospital.healthhandwash;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;

import com.google.firebase.auth.FirebaseAuth;

public class SplashScreen extends AppCompatActivity
{
    private FirebaseAuth mAuth;
    private final int splashTime = 3000; // 3 second
    private final Handler handler = new Handler();

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.splash_screen);

        this.init();
        this.startSplashScreen();
    }
    private void init()
    {
        // Firebase Auth
        this.mAuth = FirebaseAuth.getInstance();
    }
    private void startSplashScreen()
    {
        this.handler.postDelayed(new Runnable()
        {
            // After splash delay moves to login screen if still logged in go to home screen
            @Override
            public void run()
            {
                if (mAuth.getCurrentUser() == null || !mAuth.isSignInWithEmailLink(null))
                {

                    moveToLoginScreen(); // User is not signed in or not verified, move to login screen
                }
                else
                {
                    moveToHomeScreen(); // User is signed in and verified, move to home screen
                }
            }
        }, this.splashTime);
    }
    private void moveToLoginScreen()
    {
        Intent login_page_intent = new Intent(SplashScreen.this,LoginScreen.class);
        startActivity(login_page_intent);
        overridePendingTransition(R.anim.fade_in,R.anim.fade_out);
        finish();
    }
    private void moveToHomeScreen()
    {
        Intent home_page_intent = new Intent(SplashScreen.this,HomeScreen.class);
        startActivity(home_page_intent);
        overridePendingTransition(R.anim.fade_in,R.anim.fade_out);
        finish();
    }
}