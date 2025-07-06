import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContextNew';
import { updateCurrentUser, changePassword } from '../../api';
import './Profile.css';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await updateCurrentUser(profileForm);
      updateUser(response.data);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setMessage('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileForm({
      full_name: user?.full_name || '',
      email: user?.email || ''
    });
    setError('');
    setMessage('');
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setError('');
    setMessage('');
  };

  return (
    <Layout className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="page-title">
            <span className="text-gradient">User Profile</span>
          </h1>
          <p className="page-subtitle">Manage your account settings and preferences</p>
        </div>

        {message && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            {error}
          </div>
        )}

        <div className="profile-content">
          {/* Profile Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Profile Information</h2>
              {!isEditing && (
                <button
                  className="btn btn-outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      full_name: e.target.value
                    }))}
                    placeholder="Enter your full name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="Enter your email"
                    className="form-input"
                    required
                  />
                  <small className="form-hint">
                    Note: Email changes require the new email to be whitelisted
                  </small>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-item">
                  <label>User ID</label>
                  <span>{user?.id}</span>
                </div>
                <div className="info-item">
                  <label>Full Name</label>
                  <span>{user?.full_name || 'Not set'}</span>
                </div>
                <div className="info-item">
                  <label>Email Address</label>
                  <span>{user?.email}</span>
                </div>
                <div className="info-item">
                  <label>Account Status</label>
                  <span className={`status ${user?.is_active ? 'active' : 'inactive'}`}>
                    {user?.is_active ? '✅ Active' : '❌ Inactive'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Member Since</label>
                  <span>{new Date(user?.created_at).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <label>Last Updated</label>
                  <span>{new Date(user?.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Security Settings Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Security Settings</h2>
              {!isChangingPassword && (
                <button
                  className="btn btn-outline"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </button>
              )}
            </div>

            {isChangingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label htmlFor="current_password">Current Password</label>
                  <input
                    type="password"
                    id="current_password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm(prev => ({
                      ...prev,
                      current_password: e.target.value
                    }))}
                    placeholder="Enter your current password"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new_password">New Password</label>
                  <input
                    type="password"
                    id="new_password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm(prev => ({
                      ...prev,
                      new_password: e.target.value
                    }))}
                    placeholder="Enter your new password"
                    className="form-input"
                    required
                    minLength={8}
                  />
                  <small className="form-hint">
                    Password must be at least 8 characters long
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm(prev => ({
                      ...prev,
                      confirm_password: e.target.value
                    }))}
                    placeholder="Confirm your new password"
                    className="form-input"
                    required
                  />
                  {passwordForm.confirm_password && 
                   passwordForm.new_password !== passwordForm.confirm_password && (
                    <small className="form-error">Passwords do not match</small>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                      loading || 
                      passwordForm.new_password !== passwordForm.confirm_password ||
                      passwordForm.new_password.length < 8
                    }
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleCancelPasswordChange}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="security-info">
                <div className="info-item">
                  <label>Password</label>
                  <span>••••••••••••</span>
                </div>
                <div className="info-item">
                  <label>Last Password Change</label>
                  <span>Not tracked</span>
                </div>
                <div className="security-tips">
                  <h4>Security Tips:</h4>
                  <ul>
                    <li>Use a strong, unique password</li>
                    <li>Change your password regularly</li>
                    <li>Don't share your credentials</li>
                    <li>Log out from shared devices</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Account Information Card */}
          <div className="profile-card">
            <div className="card-header">
              <h2>Account Information</h2>
            </div>
            
            <div className="account-info">
              <div className="info-section">
                <h4>Authentication</h4>
                <div className="info-item">
                  <label>Authentication Method</label>
                  <span>JWT Token-based</span>
                </div>
                <div className="info-item">
                  <label>Session Duration</label>
                  <span>24 hours</span>
                </div>
              </div>

              <div className="info-section">
                <h4>Access Level</h4>
                <div className="info-item">
                  <label>User Type</label>
                  <span>Standard User</span>
                </div>
                <div className="info-item">
                  <label>Whitelisted Email</label>
                  <span>✅ Yes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ProfilePage;