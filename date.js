
//module.exports = getDate;   //gatDate is passed in this module

//if we want to add more functions in this date.js then we can use 

exports.getDate = function(){             //now it is a function and it can be easily used anywhere just by importing it
                   let today = new Date();
                   let options = { weekday : "long",
                                   day : "numeric", 
                                   month : "long",
                                  }
       return today.toLocaleDateString("en-US", options)  //this converts a date to a string returning the date portion 
                         //using the os locales conventions i.e the region and options acc. which date will be formatted
          }
exports.getDay = function(){
                   let today = new Date();
                   let options = {  weekday : "long", } 
   
                 return today.toLocaleDateString("en-US", options) 
           }
 