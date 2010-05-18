#!/usr/bin/env ruby
# -*- coding: utf-8 -*-
require 'rubygems'
require 'sinatra'
require 'sinatra/reloader' if development?
require 'rack'
require 'erb'
require 'json'
require 'tokyocabinet'
include TokyoCabinet

@@dbdir = 'db'

def db_open(dbname='/')
  dbname = dbname.to_s.gsub(/\//, '_')
  @pages = HDB.new
  Dir.mkdir(@@dbdir) if !File.exists?(@@dbdir)
  @pages.open("#{@@dbdir}/_#{dbname}.tch", HDB::OWRITER|HDB::OCREAT)  
end

after do
  @pages.close if @pages
end

get '/' do
  erb :index
end

get '*/' do
  erb :search
end

get '*.json' do
  db_open(params[:splat])
  if @pages.keys.size < 1
    @mes = {'text' => "(empty)"}.to_json
  else
    key = @pages.keys.last
    @mes = {'text' => @pages[key]}.to_json
  end
end

post '*.json' do
  db_open(params[:splat])
end

get '*' do
  erb :edit
end

