
var path = require('path'),
  util = require('util'),
  grunt = require('grunt'),
  yeoman = require('yeoman'),
  angularUtils = require('../util.js');

module.exports = Generator;


function titleize(str){
  if (str == null) return '';
  return String(str).replace(/(?:^|\s)\S/g, function(c){ return c.toUpperCase(); });
}

function classify(str){
  return titleize(String(str).replace(/[\W_]/g, ' ')).replace(/\s/g, '');
}

function Generator() {

  yeoman.generators.NamedBase.apply(this, arguments);
  this.sourceRoot(path.join(__dirname, '../templates'));

  this.appname = path.basename(process.cwd());
  
  this.action = this.args[1];
  if(this.action == 'view' || this.action == 'update'){
    this.action += '/:id';
  }
  
  this.filename = this.name + this.args[1].charAt(0).toUpperCase() + this.args[1].substr(1);
 
  this.hookFor('angularcrud:crud-controller', {
    args: [this.name, this.filename, this.action]
  });
  this.hookFor('angularcrud:crud-view', {
    args: [this.name, this.filename]
  });
}

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.rewriteAppJs = function() {
  var file = 'app/scripts/app.js'; // TODO: coffee
  var body = grunt.file.read(file);
  
  body = angularUtils.rewrite({
    needle: '.otherwise',
    haystack: body,
    splicable: [
      ".when('/api/" + this.name + "/" + this.action + "', {",
      "  templateUrl: 'views/" + this.name + "/" + this.filename + ".html',",
      "  controller: '" + classify(this.filename) + "Ctrl'",
      "})"
    ]
  });

  grunt.file.write(file, body);
};