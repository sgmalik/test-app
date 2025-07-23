Rails.application.routes.draw do
  get "reservations/index"
  get "menu_items/index"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root 'home#index'
  get 'about', to: 'home#about'
  post 'contact', to: 'home#contact'

  resources :menu_items
  get 'menu', to: 'menu_items#index'
  get 'reservations', to: 'reservations#index'

  resources :reservations do
    member do
      patch 'confirm', to: 'reservations#confirm'
      patch 'cancel', to: 'reservations#cancel'
    end
  end

  get 'book', to: 'reservations#new'
  # API routes
  namespace :api do
    namespace :v1 do
      resources :menu_items, only: [:index, :show, :create, :update,
      :destroy]
      resources :reservations, only: [:index, :show, :create, :update,
      :destroy] do
        member do
          patch :confirm
          patch :cancel
        end
      end

      # Documentation routes
      get 'docs', to: 'docs#index'
      get 'docs/menu_items', to: 'docs#menu_items_schema'
      get 'docs/reservations', to: 'docs#reservations_schema'
    end
  end
end
