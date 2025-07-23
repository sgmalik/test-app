# app/controllers/api/v1/auth_controller.rb
# ---------------------------------------------------------------------
# Authentication Controller (API v1)
#
# Handles user authentication endpoints:
#   • login      – issue JWT on valid credentials
#   • register   – create a new user and issue JWT
#   • logout     – client-side JWT removal (stateless)
#   • me         – fetch the current user’s profile
#
# Inherits common JSON rendering, error handling, and CSRF skipping
# from Api::V1::BaseController.
# ---------------------------------------------------------------------
class Api::V1::AuthController < Api::V1::BaseController

  # -------------------------------------------------------------------
  # POST /api/v1/login
  #
  # Authenticate a user by email and password.
  # On success, returns { success: true, data: { user:…, token:… } }.
  # On failure, returns 401 Unauthorized with error message.
  # -------------------------------------------------------------------
  def login
    # Find the user record by the submitted email
    user = User.find_by(email: params[:email])

    # Authenticate using has_secure_password's `authenticate` method
    if user&.authenticate(params[:password])
      # Generate a JWT containing the user_id
      token = JwtService.encode(user_id: user.id)

      # Render a success JSON with user info and token
      render json: {
        success: true,
        data: {
          user:  user_json(user),  # Filtered user payload
          token: token
        },
        message: 'Login successful'
      }
    else
      # Credentials invalid: render an error with 401 status
      render_error('Invalid email or password', :unauthorized)
    end
  end

  # -------------------------------------------------------------------
  # POST /api/v1/register
  #
  # Create a new user from permitted params.
  # On success, returns 201 Created with user and JWT.
  # On failure, returns 422 Unprocessable Entity with validation errors.
  # -------------------------------------------------------------------
  def register
    # Build a new User from the whitelisted parameters
    user = User.new(user_params)

    if user.save
      # Generate a JWT for the newly registered user
      token = JwtService.encode(user_id: user.id)

      # Render created response including the user JSON and token
      render json: {
        success: true,
        data: {
          user:  user_json(user),
          token: token
        },
        message: 'Registration successful'
      }, status: :created
    else
      # Registration failed due to validation errors
      render_error(
        'Registration failed',
        :unprocessable_entity,
        user.errors.full_messages  # Array of error messages
      )
    end
  end

  # -------------------------------------------------------------------
  # DELETE /api/v1/logout
  #
  # With JWT-based auth, "logging out" is handled client-side by
  # discarding the token. This endpoint simply acknowledges the action.
  # -------------------------------------------------------------------
  def logout
    render json: {
      success: true,
      message: 'Logout successful'
    }
  end

  # -------------------------------------------------------------------
  # GET /api/v1/me
  #
  # Return the profile of the currently authenticated user.
  # Requires that BaseController’s `current_user` be set via middleware
  # or token decoding logic (not shown here).
  # -------------------------------------------------------------------
  def me
    if current_user
      render json: {
        success: true,
        data: {
          user: user_json(current_user)
        }
      }
    else
      render_error('Not authenticated', :unauthorized)
    end
  end

  private

  # -------------------------------------------------------------------
  # Strong Parameters
  # Only allow email, password, and confirmation to prevent mass-assignment.
  # -------------------------------------------------------------------
  def user_params
    params.permit(:email, :password, :password_confirmation)
  end

  # -------------------------------------------------------------------
  # Serializer Helper
  #
  # Build a minimal JSON representation of a User record.
  # Includes only id, email, role, and ISO8601 timestamp.
  # Used to avoid exposing sensitive fields like password_digest.
  # -------------------------------------------------------------------
  def user_json(user)
    {
      id:         user.id,
      email:      user.email,
      role:       user.role,
      created_at: user.created_at.iso8601
    }
  end
end
