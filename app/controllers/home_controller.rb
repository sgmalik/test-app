class HomeController < ApplicationController
  def index
  end

  def about
  end

  def contact
    redirect_to about_path, notice: "Thanks for the message! We'll get back to you soon."
  end
end
