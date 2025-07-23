# app/middleware/api_request_logger.rb

# ApiRequestLogger is a custom Rack middleware that logs details about
# each HTTP request identified as an “API” call. It captures request method,
# path, response status, and processing time in milliseconds.
class ApiRequestLogger
  # --------------------------------------------------------------------------
  # Initialization
  # --------------------------------------------------------------------------
  #
  # Rack initializes middleware with the next application (or middleware) in
  # the chain. We store that in an instance variable so we can delegate to it.
  #
  # @param app [#call] the downstream Rack application or next middleware
  def initialize(app)
    @app = app  # Save the downstream app for later invocation
  end

  # --------------------------------------------------------------------------
  # Call
  # --------------------------------------------------------------------------
  #
  # This is the Rack entry point: every HTTP request passes through here.
  # We wrap the env in an ActionDispatch::Request for easy access to Rails
  # request helpers, then decide whether to log it as an API call.
  #
  # @param env [Hash] the Rack environment hash containing request data
  # @return [Array] a Rack response tuple: [status (Integer), headers (Hash), body (Array)]
  def call(env)
    # Create a Rails request object from the raw Rack env
    request = ActionDispatch::Request.new(env)

    if api_request?(request)
      # Record the start time before invoking the rest of the stack
      start_time = Time.current

      # Delegate to the next middleware or the main application
      status, headers, response = @app.call(env)

      # Record the end time once the downstream call returns
      end_time = Time.current

      # Calculate total duration in milliseconds, rounded to two decimals
      duration = ((end_time - start_time) * 1000).round(2)

      # Log formatted info: HTTP method, path, status code, and duration
      Rails.logger.info(
        "API Request: #{request.method} #{request.path} - #{status} (#{duration}ms)"
      )

      # Return the response unchanged
      [status, headers, response]
    else
      # Not an API request: skip logging and simply forward the call
      @app.call(env)
    end
  end

  private

  # --------------------------------------------------------------------------
  # api_request?
  # --------------------------------------------------------------------------
  #
  # Determines whether a given request should be treated as an API request.
  # We consider it an API request if the URL path begins with "/api/" OR if
  # the client explicitly requests JSON in the Accept header.
  #
  # @param request [ActionDispatch::Request] the wrapped request object
  # @return [Boolean] true for API requests, false otherwise
  def api_request?(request)
    # Condition 1: The path starts with the API namespace
    is_api_path = request.path.start_with?('/api/')

    # Condition 2: The client Accept header includes JSON
    accepts_json = request.headers['Accept']&.include?('application/json')

    # Return true if either condition is met
    is_api_path || accepts_json
  end
end
