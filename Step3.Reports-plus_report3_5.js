// Stages that have been excluded from the aggregation pipeline query
__3tsoftwarelabs_disabled_aggregation_stages = [

	{
		// Stage 1 - excluded
		stage: 1,  source: {
			$match: {
			    "forms.form_name": "Breast Cancer Form"
			}
		}
	},
]

db.getCollection("cases").aggregate(

	// Pipeline
	[
		// Stage 2
		{
			$project: {
			   "_id": 1,
			   "case_number": "$case_number",
			   "diagnosis": "$diagnosis",
			   "forms":"$forms"
			}
		},

		// Stage 3
		{
			$unwind: {
			    path : "$forms"
			}
		},

		// Stage 4
		{
			$lookup: {
			   //get all questions
			   "from": "questions_label",
			   "as" : "questions_label",
			   "localField": "forms.form_name",
			   "foreignField": "_id.form_name"
			}
		},

		// Stage 5
		{
			$unwind: {
			    path : "$questions_label",
			}
		},

		// Stage 6
		{
			$lookup: {
			  //get all options
			   "from": "questions_options",
			   "as" : "questions_options",
			   "localField": "forms.form_name",
			   "foreignField": "_id.form_name"
			}
		},

		// Stage 7
		{
			$unwind: {
			    path : "$questions_options"
			}
		},

		// Stage 8
		{
			$project: {
			   "_id": 0,
			   "case_id": "$_id",
			   "case_number": "$case_number",
			   "diagnosis": "$diagnosis",
			   "form_date_created": "$forms.date_created",
			   "form_id": "$forms.form_id",
			   "form_name": "$forms.form_name",
			   "questions": "$questions_label.label",
			   "options":"$questions_options.options",
			   "answers":"$forms.answers.question_answer"
			}
		},

		// Stage 9
		{
			$project: {
			    "id": true,
			    "case_number": true,
			    "case_id": true, 
			    "diagnosis": true,
			    "form_id": true,
			    "form_name": true,
			    "form_date_created": true,
			    "key_value": {  
			        $arrayToObject: {
			            //map the questions and answers into object
			            $map: {
			                input: "$questions",
			                as: "question",
			                in: {
			                    "$cond": {
			                    //check if answers has more than 1 answer
			                    "if" : {  "$eq" : [         
			                            {
			                                $let: {
			                                    vars: { 
			                                        varin: { 
			                                           
			                                     
			                                            $arrayElemAt: [ 
			                                              "$answers",  
			                                              { $indexOfArray : [ "$questions", "$$question" ] }
			                                            ]
			                                        } 
			                                    },
			                                    in: { 
			                                        $size: {
			                                            $reduce: {
			                                                input: ["$$varin"],
			                                                initialValue: "",
			                                                in:  "$$varin"
			                                            }
			                                        }
			                                    }
			                                }
			                            } ,  
			                        1 ]  } ,
			                
			                        //if answers equal to 1 answer
			                        "then" :  { 
			                            "k" : "$$question" , 
			                            "v" : { $min: { $arrayElemAt: [ "$answers", { "$indexOfArray" : [ "$questions", "$$question" ] } ] } }
			                        },
			                        //if answers has more than 1 answers
			                        "else" : {
			                        "k" : "$$question",
			                        "v" : { $arrayElemAt: [ "$answers", { "$indexOfArray" : [ "$questions", "$$question" ] } ] }
			                        }
			        
			                    } 
			                }
			            }
			        }
			    }
			}
		},

		// Stage 10
		{
			$addFields: {
			  //copy all outside fields inside keyvalue for replaceRoot
			   "key_value._id": "$id",
			   "key_value._case_id": "$case_id", 
			   "key_value._case_number": "$case_number" ,
			   "key_value._form_id": "$form_id",
			   "key_value._form_name": "$form_name",
			   "key_value._form_date_created": "$form_date_created",
			   "key_value._diagnosis": "$diagnosis"
			}
		},

		// Stage 11
		{
			$replaceRoot: {
			  "newRoot": "$key_value" ,
			
			}
		},

		// Stage 12
		{
			$project: {
			   //map to pivot multiple answers
			   "date_created" : "$_form_date_created",
			    "ROOT" : "$$ROOT",
			    
			    //"ROOT" : "$$ROOT",
			   // "t_arrayToObject" : { $arrayToObject: { $literal: [ { "k": "Primary Organ Site", "v": "Breast"} ] } },
			   // "t_objectToArray": { $objectToArray:  { "Primary Organ Site" : "Breast" } },
			   // "objectToArray" : { $objectToArray: "$$ROOT" },  
			     "_id" : 1,
			     "map" : {
			       //$arrayToObject: {
			        $map: {
			           input:  { $objectToArray: "$$ROOT" } ,
			           as: "root",
			           in:   
			           //2nd param
			           {
			               "$cond" : {
			                     //values IS array
			                     "if" : {  "$eq" : [   { $isArray: "$$root.v" } , true ] } , 
			                     
			                     
			                       "then" : { 
			                          $arrayToObject: {
			                              $map: {
			                                 input: "$$root.v" ,
			                                    as: "value",
			                                       in: [ 
			                                           { $concat: [ "$$root.k", " - ", "$$value" ] }, 
			                                           NumberInt(1)
			                                       ]
			                              }  
			                           }
			                                
			                       },
			                       //values is not array
			            
			                     //"else" : { $arrayToObject: { $literal: [ { "k": "Primary Organ Site", "v": "Breast"} ] } },
			    
			                       "else" : { 
			                    
			                    
			                          $arrayToObject: {
			                              $map: {
			                                 input: { $objectToArray: "$$root" },
			                                    as: "value",
			                                       in: [ 
			                                            "$$root.k" , 
			                                            "$$root.v"  
			                                       ]
			                              }  
			                           }
			                              
			                    
			                                
			                       }
			                       
			                     
			                      
			                 }
			              
			            }
			          }
			     //}
			    }
			}
		},

		// Stage 13
		{
			$unwind: {
			  //unwind to explode answer arrays
			    path : "$map",
			   // includeArrayIndex : "arrayIndex", // optional
			   // preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 14
		{
			$group: {
			     _id: "$date_created", 
			     "results": { $mergeObjects: "$map" } 
			}
		},

		// Stage 15
		{
			$replaceRoot: {
			    newRoot: "$results"
			}
		},

		// Stage 16
		{
			$out: "medicalreports"
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
