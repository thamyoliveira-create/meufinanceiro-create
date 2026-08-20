# Servidor Local Ruby Zero-Dependency - Meu Financeiro IA
# Inicie com: ruby server.rb

require 'webrick'

port = ENV['PORT'] || 3000
root = File.expand_path(File.dirname(__FILE__))

mime_types = WEBrick::HTTPUtils::DefaultMimeTypes
mime_types.store 'js', 'application/javascript'
mime_types.store 'mjs', 'application/javascript'
mime_types.store 'css', 'text/css'
mime_types.store 'json', 'application/json'
mime_types.store 'svg', 'image/svg+xml'

server = WEBrick::HTTPServer.new(
  Port: port,
  DocumentRoot: root,
  MimeTypes: mime_types,
  Logger: WEBrick::Log.new(STDOUT, WEBrick::Log::INFO),
  AccessLog: []
)

trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }

puts "=========================================================="
puts "  Meu Financeiro IA - Servidor Ativo!"
puts "  Acesse no seu navegador: http://localhost:#{port}"
puts "=========================================================="

server.start
