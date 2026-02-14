import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { ArrowLeft, Mail, Smartphone, Lock, User } from 'lucide-react-native';
import axiosInstance from '../../axiosInstance'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isLargeScreen = width > 768;

const LoginScreen = () => {
  const [activeTab, setActiveTab] = useState('login'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible2, setPasswordVisible2] = useState(false);
  
  const navigation = useNavigation();

  // Form states
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [otpData, setOtpData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Validation functions
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateMobile = (mobile) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(mobile);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // 1. Register User
const handleRegister = async () => {
  // Validate all fields
  const errors = [];
  
  if (!registerData.firstName.trim()) errors.push('First name is required');
  if (!registerData.lastName.trim()) errors.push('Last name is required');
  if (!validateEmail(registerData.email)) errors.push('Please enter a valid email address');
  if (!validateMobile(registerData.mobile)) errors.push('Please enter a valid 10-digit mobile number');
  if (!validatePassword(registerData.password)) errors.push('Password must be at least 6 characters long');
  if (registerData.password !== registerData.confirmPassword) errors.push('Passwords do not match');

  if (errors.length > 0) {
    setError(errors[0]);
    return;
  }

  setIsSubmitting(true);
  setError(null);

  console.log("Registration data being sent:", registerData);
  
  try {
    // FIXED: Use '/register' not '/api/register' because baseURL already has '/api'
    const response = await axiosInstance.post('/register', {
      firstName: registerData.firstName,
      lastName: registerData.lastName,
      email: registerData.email,
      mobile: registerData.mobile,
      password: registerData.password
    });

    console.log("Registration response:", response.data);

    if (response.data.success) {
      setSuccessMessage('Registration successful! Please verify your email with OTP.');
      
      // Save temporary token for verification
      if (response.data.data?.token) {
        await AsyncStorage.setItem('tempToken', response.data.data.token);
      }
      await AsyncStorage.setItem('verificationEmail', registerData.email);
      
      setOtpData({ 
        ...otpData, 
        email: registerData.email,
        otp: '' // Clear any existing OTP
      });
      setActiveTab('verifyEmail');
    }
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });
    
    // Handle specific error cases
    if (error.response?.status === 400) {
      if (error.response?.data?.message?.includes('already')) {
        setError(error.response.data.message);
      } else if (error.response?.data?.errors) {
        setError(error.response.data.errors[0]);
      } else {
        setError(error.response?.data?.message || 'Registration failed');
      }
    } else if (error.code === 'ECONNREFUSED') {
      setError('Cannot connect to server. Please check if the server is running.');
    } else {
      setError('Registration failed. Please try again.');
    }
  } finally {
    setIsSubmitting(false);
  }
};

  // 2. Verify Email with OTP
  const handleVerifyEmail = async () => {
    if (!otpData.otp || otpData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/verify-email', {
        email: otpData.email,
        otp: otpData.otp,
      });

      if (response.data.success) {
        // Save auth token and user data
        await AsyncStorage.setItem('authToken', response.data.data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.data.user));
        
        // Clear temp token
        await AsyncStorage.removeItem('tempToken');
        await AsyncStorage.removeItem('verificationEmail');
        
        setSuccessMessage('Email verified successfully!');
        setOtpData({
  email: '',
  otp: '',
  newPassword: '',
  confirmPassword: '',
});

// switch to login screen
setActiveTab('login');
      }
    } catch (error) {
      console.error('Verify email error:', error);
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Resend OTP
  const handleResendOTP = async () => {
    // Get email from AsyncStorage or state
    const email = await AsyncStorage.getItem('verificationEmail') || otpData.email;
    
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/api/users/resend-otp', {
        email: email,
      });

      if (response.data.success) {
        setSuccessMessage('OTP resent successfully!');
        setResendTimer(60);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Login User
  const handleLogin = async () => {
    if (!validateEmail(loginData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!loginData.password) {
      setError('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/login', {
        email: loginData.email,
        password: loginData.password,
      });


      if (response.data.success) {
  const { user, token } = response.data.data;

  // Save token and user data
  await AsyncStorage.setItem('authToken', token);
  await AsyncStorage.setItem('userData', JSON.stringify(user));

  // 🔥 Register FCM token WITH userId
  const { registerFCMToken } = require("../../utils/fcm");
  registerFCMToken(user.id || user._id);

  setSuccessMessage('Login successful!');

  setTimeout(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  }, 500);
}

    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.response?.status === 403) {
        setError('Please verify your email first');
      } else if (error.response?.status === 423) {
        setError('Account is locked. Please try again later.');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Forgot Password - Request OTP
  const handleForgotPassword = async () => {
    if (!validateEmail(otpData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/api/users/forgot-password', {
        email: otpData.email,
      });

      if (response.data.success) {
        setSuccessMessage('Password reset OTP sent to your email!');
        setResendTimer(60);
        setActiveTab('resetPassword');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Reset Password with OTP
  const handleResetPassword = async () => {
    if (!otpData.otp || otpData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!validatePassword(otpData.newPassword)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (otpData.newPassword !== otpData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/api/users/reset-password', {
        email: otpData.email,
        otp: otpData.otp,
        newPassword: otpData.newPassword,
      });

      if (response.data.success) {
        setSuccessMessage('Password reset successful! Please login.');
        Alert.alert('Success', 'Password reset successful!', [
          {
            text: 'Login Now',
            onPress: () => {
              // Save token if provided
              if (response.data.data.token) {
                AsyncStorage.setItem('authToken', response.data.data.token);
              }
              setActiveTab('login');
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const renderLoginForm = () => (
    <>
    
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <View style={styles.inputContainer}>
          <Mail size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="example@email.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={loginData.email}
            onChangeText={(text) => setLoginData({ ...loginData, email: text })}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <View style={styles.passwordLabelContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TouchableOpacity onPress={() => {
            setOtpData({ ...otpData, email: loginData.email });
            setActiveTab('forgotPassword');
          }}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Lock size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="Enter your password"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!passwordVisible}
            value={loginData.password}
            onChangeText={(text) => setLoginData({ ...loginData, password: text })}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Text style={styles.eyeIconText}>{passwordVisible ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.submitButton, 
          (!validateEmail(loginData.email) || !loginData.password || isSubmitting) && styles.disabledButton
        ]} 
        onPress={handleLogin}
        disabled={!validateEmail(loginData.email) || !loginData.password || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => setActiveTab('register')}>
          <Text style={styles.switchLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>First Name *</Text>
        <View style={styles.inputContainer}>
          <User size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="Enter first name"
            placeholderTextColor="#94A3B8"
            value={registerData.firstName}
            onChangeText={(text) => setRegisterData({ ...registerData, firstName: text })}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Last Name *</Text>
        <View style={styles.inputContainer}>
          <User size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="Enter last name"
            placeholderTextColor="#94A3B8"
            value={registerData.lastName}
            onChangeText={(text) => setRegisterData({ ...registerData, lastName: text })}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <View style={styles.inputContainer}>
          <Mail size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="example@email.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={registerData.email}
            onChangeText={(text) => setRegisterData({ ...registerData, email: text })}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Mobile Number *</Text>
        <View style={styles.inputContainer}>
          <Smartphone size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            placeholder="9876543210"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            maxLength={10}
            value={registerData.mobile}
            onChangeText={(text) => setRegisterData({ ...registerData, mobile: text.replace(/[^0-9]/g, '') })}
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Password *</Text>
        <View style={styles.inputContainer}>
          <Lock size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="At least 6 characters"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!passwordVisible}
            value={registerData.password}
            onChangeText={(text) => setRegisterData({ ...registerData, password: text })}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Text style={styles.eyeIconText}>{passwordVisible ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Confirm Password *</Text>
        <View style={styles.inputContainer}>
          <Lock size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="Confirm your password"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!passwordVisible2}
            value={registerData.confirmPassword}
            onChangeText={(text) => setRegisterData({ ...registerData, confirmPassword: text })}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible2(!passwordVisible2)}
          >
            <Text style={styles.eyeIconText}>{passwordVisible2 ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.requiredNote}>* Required fields</Text>

      <TouchableOpacity 
        style={[
          styles.submitButton, 
          (!registerData.firstName || !registerData.lastName || !validateEmail(registerData.email) || 
           !validateMobile(registerData.mobile) || !validatePassword(registerData.password) || 
           registerData.password !== registerData.confirmPassword || isSubmitting) && styles.disabledButton
        ]} 
        onPress={handleRegister}
        disabled={!registerData.firstName || !registerData.lastName || !validateEmail(registerData.email) || 
                 !validateMobile(registerData.mobile) || !validatePassword(registerData.password) || 
                 registerData.password !== registerData.confirmPassword || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setActiveTab('login')}>
          <Text style={styles.switchLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderVerifyEmailForm = () => (
    <>
      <View style={styles.otpHeader}>
        <Text style={styles.otpTitle}>Verify Your Email</Text>
        <Text style={styles.otpSubtitle}>
          We've sent a 6-digit OTP to {'\n'}
          <Text style={styles.emailText}>{otpData.email}</Text>
        </Text>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>6-Digit OTP *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.otpInput]}
            placeholder="000000"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={6}
            value={otpData.otp}
            onChangeText={(text) => setOtpData({ ...otpData, otp: text.replace(/[^0-9]/g, '') })}
            textAlign="center"
          />
        </View>
      </View>

      <View style={styles.otpActions}>
        <TouchableOpacity 
          style={styles.resendButton}
          onPress={resendTimer === 0 ? handleResendOTP : null}
          disabled={resendTimer > 0 || isSubmitting}
        >
          <Text style={[
            styles.resendText,
            resendTimer > 0 && styles.resendDisabled
          ]}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('register')}>
          <Text style={styles.changeEmailText}>Change Email</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[
          styles.submitButton, 
          (otpData.otp.length !== 6 || isSubmitting) && styles.disabledButton
        ]} 
        onPress={handleVerifyEmail}
        disabled={otpData.otp.length !== 6 || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitText}>Verify Email</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderForgotPasswordForm = () => (
    <>
      <View style={styles.otpHeader}>
        <Text style={styles.otpTitle}>Forgot Password</Text>
        <Text style={styles.otpSubtitle}>
          Enter your email to receive OTP
        </Text>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Email Address *</Text>
        <View style={styles.inputContainer}>
          <Mail size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="example@email.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={otpData.email}
            onChangeText={(text) => setOtpData({ ...otpData, email: text })}
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.submitButton, 
          (!validateEmail(otpData.email) || isSubmitting) && styles.disabledButton
        ]} 
        onPress={handleForgotPassword}
        disabled={!validateEmail(otpData.email) || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitText}>Send OTP</Text>
        )}
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Remember password? </Text>
        <TouchableOpacity onPress={() => setActiveTab('login')}>
          <Text style={styles.switchLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderResetPasswordForm = () => (
    <>
      <View style={styles.otpHeader}>
        <Text style={styles.otpTitle}>Reset Password</Text>
        <Text style={styles.otpSubtitle}>
          Enter OTP and new password
        </Text>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>6-Digit OTP *</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.otpInput]}
            placeholder="000000"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={6}
            value={otpData.otp}
            onChangeText={(text) => setOtpData({ ...otpData, otp: text.replace(/[^0-9]/g, '') })}
            textAlign="center"
          />
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>New Password *</Text>
        <View style={styles.inputContainer}>
          <Lock size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="At least 6 characters"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!passwordVisible}
            value={otpData.newPassword}
            onChangeText={(text) => setOtpData({ ...otpData, newPassword: text })}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Text style={styles.eyeIconText}>{passwordVisible ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Confirm New Password *</Text>
        <View style={styles.inputContainer}>
          <Lock size={isSmallScreen ? 18 : 20} color="#64748B" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, styles.inputWithIcon]}
            placeholder="Confirm new password"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!passwordVisible2}
            value={otpData.confirmPassword}
            onChangeText={(text) => setOtpData({ ...otpData, confirmPassword: text })}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible2(!passwordVisible2)}
          >
            <Text style={styles.eyeIconText}>{passwordVisible2 ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.requiredNote}>* Required fields</Text>

      <View style={styles.otpActions}>
        <TouchableOpacity 
          style={styles.resendButton}
          onPress={resendTimer === 0 ? handleForgotPassword : null}
          disabled={resendTimer > 0 || isSubmitting}
        >
          <Text style={[
            styles.resendText,
            resendTimer > 0 && styles.resendDisabled
          ]}>
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[
          styles.submitButton, 
          (otpData.otp.length !== 6 || !validatePassword(otpData.newPassword) || 
           otpData.newPassword !== otpData.confirmPassword || isSubmitting) && styles.disabledButton
        ]} 
        onPress={handleResetPassword}
        disabled={otpData.otp.length !== 6 || !validatePassword(otpData.newPassword) || 
                 otpData.newPassword !== otpData.confirmPassword || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.submitText}>Reset Password</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const getScreenTitle = () => {
    switch (activeTab) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Create Account';
      case 'verifyEmail': return 'Verify Email';
      case 'forgotPassword': return 'Forgot Password';
      case 'resetPassword': return 'Reset Password';
      default: return 'Welcome Back';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content"   />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            {/* <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                if (activeTab === 'login') {
                  navigation.goBack();
                } else {
                  setActiveTab('login');
                }
              }}
            >
              <ArrowLeft size={isSmallScreen ? 20 : 24} color="#2C3E50" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
             */}
            <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
          </View>

          {/* Illustration - Responsive */}
          {activeTab !== 'verifyEmail' && activeTab !== 'resetPassword' && (
            <View style={styles.illustrationContainer}>
              <Image
                source={require('../../assets/logo.jpeg')}
                style={[
                  styles.illustrationImage,
                  isSmallScreen && styles.illustrationImageSmall,
                  isLargeScreen && styles.illustrationImageLarge
                ]}
                resizeMode="contain"
              />
              {activeTab === 'login' && (
                <Text style={styles.welcomeText}>
                  Sign in to access your account
                </Text>
              )}
            </View>
          )}

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Success Message */}
            {successMessage && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* Tab Navigation */}
            {activeTab === 'login' && renderLoginForm()}
            {activeTab === 'register' && renderRegisterForm()}
            {activeTab === 'verifyEmail' && renderVerifyEmailForm()}
            {activeTab === 'forgotPassword' && renderForgotPasswordForm()}
            {activeTab === 'resetPassword' && renderResetPasswordForm()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: isSmallScreen ? "16%" : "30%",
    paddingTop: Platform.OS === 'ios' ? "8%" : "8%",
    paddingBottom: isSmallScreen ? 16 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '500',
    color: '#475569',
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 20,
    flex: 1,
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 20 : 40,
    backgroundColor: '#FFFFFF',
  },
  illustrationImage: {
    width: width * 0.6,
    height: height * 0.25,
    marginBottom: 20,
  },
  illustrationImageSmall: {
    width: width * 0.5,
    height: height * 0.2,
  },
  illustrationImageLarge: {
    width: width * 0.4,
    height: height * 0.3,
  },
  welcomeText: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: isSmallScreen ? 20 : 24,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: height * 0.5,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: isSmallScreen ? 12 : 14,
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: 20,
  },
  successText: {
    color: '#065F46',
    fontSize: isSmallScreen ? 12 : 14,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: isSmallScreen ? 16 : 20,
  },
  inputLabel: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  passwordLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#C21807',
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: isSmallScreen ? 14 : 16,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: isSmallScreen ? 14 : 16,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: isSmallScreen ? 12 : 14,
    zIndex: 1,
  },
  eyeIconText: {
    fontSize: isSmallScreen ? 16 : 20,
  },
  countryCode: {
    position: 'absolute',
    left: 48,
    top: isSmallScreen ? 14 : 16,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#475569',
    fontWeight: '500',
    zIndex: 1,
  },
  phoneInput: {
    paddingLeft: 90,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  requiredNote: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'right',
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? 24 : 32,
  },
  otpTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  emailText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 24 : 32,
  },
  resendButton: {
    paddingVertical: 8,
  },
  resendText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  resendDisabled: {
    color: '#94A3B8',
  },
  changeEmailText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: '#C21807',
    borderRadius: 12,
    paddingVertical: isSmallScreen ? 16 : 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#e0574a',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#f68479',
    opacity: 0.7,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: isSmallScreen ? 24 : 32,
  },
  switchText: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#64748B',
  },
  switchLink: {
    fontSize: isSmallScreen ? 13 : 14,
    color: '#C21807',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default LoginScreen;