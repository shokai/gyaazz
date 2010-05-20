require 'rubygems'

begin
 require "bundler"
rescue LoadError => e
else
  Bundler.setup
end


require 'sinatra'

require 'main.rb'

run Sinatra::Application
