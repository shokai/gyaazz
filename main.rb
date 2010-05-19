#!/usr/bin/env ruby
# -*- coding: utf-8 -*-
require 'rubygems'
require 'sinatra'
require 'sinatra/reloader' if development?
require 'rack'
require 'erb'
require 'json'
require 'uri'
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
    @mes = {'lines' => ["(empty)"]}.to_json
  else
    key = @pages.keys.last
    @mes = @pages[key]
  end
end

post '*.json' do
  begin
    db_open(params[:splat])
    lines = params[:lines].delete_if{|i| i.size < 1 or i=~/^\s+$/}
    if last_key = @pages.keys.last and JSON.parse(@pages[last_key])['lines'] == lines
      @mes = {'success' => true, 'message' => 'saved'}.to_json
    else
      now = Time.now
      key = "#{now.to_i}_#{now.usec}"
      @pages[key] = {'lines' => lines}.to_json
      if lines.size < 2 and lines.first == "(empty)"
        # ページの削除処理
        @mes = {'success' => true, 'message' => 'delete page'}.to_json
      else
        @mes = {'success' => true, 'message' => 'saved!'}.to_json
      end
    end
  rescue
    @mes = {'error' => true, 'message' => 'save error!'}.to_json
  end
end

get '*' do
  @root_path = '../'*(params[:splat].first.split(/\//).size-2)
  erb :edit
end

