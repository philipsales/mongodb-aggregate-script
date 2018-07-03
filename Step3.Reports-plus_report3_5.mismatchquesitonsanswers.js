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
			$lookup: {
			  //get all options
			   "from": "questions_type",
			   "as" : "questions_type",
			   "localField": "forms.form_name",
			   "foreignField": "_id.form_name"
			}
		},

		// Stage 9
		{
			$unwind: {
			    path : "$questions_type"
			}
		},

		// Stage 10
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
			   "type": "$questions_type.type",
			   "options":"$questions_options.options",
			   "answers":"$forms.answers.question_answer",
			   "size": { $size: "$forms.answers.question_answer" }
			}
		},

		// Stage 11
		{
			$project: {
			    "id": true,
			    "case_number": true,
			    "case_id": true, 
			    "diagnosis": true,
			    "form_id": true,
			    "form_name": true,
			    "form_date_created": true,
			    "answers": true,
			    "type": true,
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
			                                          
			                                           $cond: [ 
			                                           //iterate if answer is null
			                                           {
			                                             $arrayElemAt: [ 
			                                              "$answers",  
			                                              { $indexOfArray : [ "$questions", "$$question" ] }
			                                            ]
			                                           }
			                                            //then if answer NOT NULL set key value object 
			                                            //(e.g. Diagnosis.Laterality: Right)
			                                            ,{
			                                             $arrayElemAt: [ 
			                                              "$answers",  
			                                              { $indexOfArray : [ "$questions", "$$question" ] }
			                                            ]
			                                           }
			                                           ,
			                                           //else - set null if no answer for equal array number 
			                                           //(e.g. Diagnosis.Laterality: Right)
			                                           [""]
			                                           
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
			                        //equal to 1 answer  
			                        1 
			                        ]  } ,
			                  
			                        //if answers equal to 1 answer
			                        "then" :  {
			                             
			                             //check question type
			                             $cond: [
			                               //if question type textbox
			                               { 
			                                 $or: [
			                                   {  $eq: [ { $arrayElemAt: [ "$type", { "$indexOfArray" : [ "$questions", "$$question" ] } ]  }, "textbox" ] },
			                                   {  $eq: [ { $arrayElemAt: [ "$type", { "$indexOfArray" : [ "$questions", "$$question" ] } ]  }, "datepicker" ] },
			                                  // {  $ne: [ { $min: { $arrayElemAt: [ "$answers", { "$indexOfArray" : [ "$questions", "$$question" ] } ] } },  "" ] }
			                                 
			                                 ]
			                               
			                               }
			                               ,
			                               //if textbox or datepicker, retain value, set null if no value
			                               {
			                                 
			                                 "k" : "$$question" , 
			                                 "v" : { 
			                                     //set empty string if null
			                                     $ifNull: 
			                                     [ 
			                                     { $min: { $arrayElemAt: [ "$answers", { "$indexOfArray" : [ "$questions", "$$question" ] } ] } }, 
			                                     "" 
			                                     ] 
			                                 }
			                                 
			                               },
			                               
			                               //else set value as array if only have 1 answer else set as null
			                               {
			                                 
			                                   $cond: [
			                                     {  $ne: [ { $min: { $arrayElemAt: [ "$answers", { "$indexOfArray" : [ "$questions", "$$question" ] } ] } },  "" ] },
			                                     {
			                                       "k" : "$$question",
			                                       "v" : { $arrayElemAt: [ "$answers", { "$indexOfArray" : [ "$questions", "$$question" ] } ] }
			                                     },
			                                     {
			                                       "k" : "$$question",
			                                       "v" : ""
			                                     }
			                                     
			                                   ]
			                                
			                                 }
			                                 
			                               
			                             ]
			                         
			                             
			                            
			                        },
			                        //if answers has more than 1 answers
			                        "else" : {
			                          "k" : "$$question",
			                         // "v" : "bar"
			                          "v" : { $arrayElemAt: [ "$answers", { "$indexOfArray" : [ "$questions", "$$question" ] } ] }
			                        }
			        
			                    } 
			                }
			            }
			        }
			    }
			}
		},

		// Stage 12
		{
			$addFields: {
			  //copy all outside fields inside keyvalue for replaceRoot
			   "key_value.AA_id": "$id",
			   "key_value.AA_case_id": "$case_id", 
			   "key_value.AA_case_number": "$case_number" ,
			   "key_value.AA_form_id": "$form_id",
			   "key_value.AA_form_name": "$form_name",
			   "key_value.AA_form_date_created": "$form_date_created",
			   "key_value.AA_diagnosis": "$diagnosis"
			}
		},

		// Stage 13
		{
			$replaceRoot: {
			  "newRoot": "$key_value" ,
			
			}
		},

		// Stage 14
		{
			$project: {
			   //map to pivot multiple answers
			   "date_created" : "$AA_form_date_created",
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
			               "$cond" : [
			                     //check if value IS array
			                     {  
			                       $or: [
			                         { $eq : [   { $isArray: "$$root.v" } , true ] } ,
			                        // { $ne : [  "$$root.v"  , "" ] } ,
			                       ]
			                     
			                     },
			                     //if array then explode and assign Value as 1
			                     //(e.g Diagnosis.Uterus: 1, Diagnosis. Ovary: 1)
			                      // "then" : 
			                     { 
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
			    
			                    //   "else"
			                     { 
			                    
			                    
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
			                       
			                     
			                      
			                 ]
			              
			            }
			          }
			     //}
			    }
			}
		},

		// Stage 15
		{
			$unwind: {
			  //unwind to explode answer arrays
			    path : "$map",
			   // includeArrayIndex : "arrayIndex", // optional
			   // preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 16
		{
			$group: {
			     _id: "$date_created", 
			     "results": { $mergeObjects: "$map" } 
			}
		},

		// Stage 17
		{
			$replaceRoot: {
			    newRoot: "$results"
			}
		},

		// Stage 18
		{
			$out: "medicalreports"
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
