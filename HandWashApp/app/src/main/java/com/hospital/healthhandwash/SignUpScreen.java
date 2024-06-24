package com.hospital.healthhandwash;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

public class SignUpScreen extends AppCompatActivity implements View.OnClickListener,
        OnCompleteListener<AuthResult>, AdapterView.OnItemClickListener
{
    private SharedPreferences sharedPref;
    private SharedPreferences.Editor editor;
    private FirebaseAuth auth;
    private FirebaseDatabase database;
    private DatabaseReference reference;
    private EditText et_name, signupEmail, signupPassword, signupPasswordReType;
    private Button signupButton;
    private TextView loginRedirectText;
    private AutoCompleteTextView actvProfession;
    private final String KEY_USERS = "users";
    private final String[] professions = {"Doctor", "Nurse", "Surgeon"};
    private ArrayAdapter<String> adapterItems;
    private String profession;

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.signup_screen);

        this.init();
        // Set default selection to "Doctor"
        this.profession = professions[0];

        // Attribute Listeners
        this.signupButton.setOnClickListener(this);
        this.loginRedirectText.setOnClickListener(this);

        // Set the OnItemClickListener for AutoCompleteTextView
        this.actvProfession.setOnItemClickListener(this);
    }

    private void init()
    {
        this.auth = FirebaseAuth.getInstance();
        this.actvProfession = findViewById(R.id.actvProfession);
        this.et_name = findViewById(R.id.et_name);
        this.signupEmail = findViewById(R.id.signup_email);
        this.signupPassword = findViewById(R.id.signup_password);
        this.signupPasswordReType = findViewById(R.id.signup_password_re_type);
        this.signupButton = findViewById(R.id.signup_button);
        this.loginRedirectText = findViewById(R.id.loginRedirectText);
        // firebase realtime
        this.database = FirebaseDatabase.getInstance();
        this.reference = this.database.getReference(this.KEY_USERS);
        // Shared preferences
        this.sharedPref = getSharedPreferences(String.valueOf(R.string.shared_pref_file_name),MODE_PRIVATE);
        this.editor = this.sharedPref.edit();
        // Dropdown menu
        this.adapterItems = new ArrayAdapter(this, R.layout.list_professions, professions);
        this.actvProfession.setAdapter(this.adapterItems);
    }
    private void singUpLogic()
    {
        String email = this.signupEmail.getText().toString().trim();
        String pass = this.signupPassword.getText().toString().trim();
        String passReType = this.signupPasswordReType.getText().toString().trim();

        if(this.actvProfession.getText().toString().isEmpty())
        {
            this.actvProfession.setError("Empty fields are not allowed");
        }
        else if(this.et_name.getText().toString().trim().isEmpty())
        {
            this.et_name.setError("Empty fields are not allowed");
        }
        else if (email.isEmpty())
        {
            this.signupEmail.setError("Email cannot be empty");
        }

        if (pass.isEmpty())
        {
            this.signupPassword.setError("New password cannot be empty");
        }
        else if (passReType.isEmpty())
        {
            this.signupPasswordReType.setError("Verify password cannot be empty");
        }
        else if(!passReType.equals(pass))
        {
            this.signupPasswordReType.setError("Verify password do not match");
        }
        else
        {
            this.auth.createUserWithEmailAndPassword(email, pass).addOnCompleteListener(this);
        }
    }
    private void moveToLoginScreen()
    {
        Intent login_page_intent = new Intent(SignUpScreen.this,LoginScreen.class);
        startActivity(login_page_intent);
        overridePendingTransition(R.anim.fade_in,R.anim.fade_out);
        finish();
    }

    @Override
    public void onClick(View v)
    {
        if(v == this.loginRedirectText)
        {
            this.moveToLoginScreen();
        }
        if(v == this.signupButton)
        {
            Animation buttonLoginAnimation = AnimationUtils.loadAnimation(this, R.anim.fade_in);
            this.signupButton.startAnimation(buttonLoginAnimation);
            this.singUpLogic();
        }
    }

    @Override
    public void onComplete(@NonNull Task<AuthResult> task)
    {
        if (task.isSuccessful())
        {
            Toast.makeText(SignUpScreen.this, "SignUp Successful", Toast.LENGTH_SHORT).show();

            // Get the user UID
            String userUid = FirebaseAuth.getInstance().getCurrentUser().getUid();

            // Add user details to the Realtime Database
            String email = this.signupEmail.getText().toString(),
                    username = this.et_name.getText().toString(),
                    whatJob = this.profession;

            User newUser = new User(email, false, false, username, whatJob);
            this.reference.child(userUid).setValue(newUser);

            // Save email and username to SharedPreferences
            this.editor.putString(String.valueOf(R.string.shared_pref_email),email);
            this.editor.putString(String.valueOf(R.string.shared_pref_name),this.et_name.getText().toString());
            this.editor.putString(String.valueOf(R.string.shared_pref_profession),this.actvProfession.getText().toString());
            this.editor.apply();
            this.moveToLoginScreen();
        }
        else
        {
            Toast.makeText(SignUpScreen.this, "SignUp Failed" + task.getException().getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onItemClick(AdapterView<?> parent, View view, int i, long id)
    {
        this.profession = parent.getItemAtPosition(i).toString();
    }
}