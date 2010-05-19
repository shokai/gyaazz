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
    @mes = {'lines' => ["(empty)","2","3"]}.to_json
  else
    key = @pages.keys.last
    @mes = @pages[key]
  end
end

post '*.json' do
  db_open(params[:splat])
  @pages['tmp'] = {'lines' => params[:lines]}.to_json
  p params
  @mes = {'save' => 'success'}.to_json
end

get '*' do
  puts params[:splat]
  @root_path = '../'*(params[:splat].first.split(/\//).size-1)
  erb :edit
end

