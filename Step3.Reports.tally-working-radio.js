// Stages that have been excluded from the aggregation pipeline query
__3tsoftwarelabs_disabled_aggregation_stages = [

	{
		// Stage 1 - excluded
		stage: 1,  source: {
			$project: {
			  'root':  "$$ROOT",
			   'objectToarray_root':  { $objectToArray: "$$ROOT" },
			   "test": {
			     $map: {
			                 input: { $objectToArray: "$$ROOT" },
			                 as: "value",
			                 in: "$$value.v"
			             }
			   },
			   "push":  {
			 
			             "k": {
			                $let:
			                     {
			                   vars: {  varin: { $objectToArray: "$$ROOT"  } },
			                   in: {
			             
			               
			                  $map: {
			                        input:  "$$varin" ,
			                         as: "value",
			                         in: "$$value.k"
			                       }
			                     }
			                     }
			             },
			             "v": {
			                $let:
			                     {
			                   vars: {  varin: { $objectToArray: "$$ROOT"  } },
			                   in: {
			             
			               
			                  $map: {
			                        input:  "$$varin" ,
			                         as: "value",
			                         in: "$$value.v"
			                       }
			                     }
			                     }
			             },
			             
			
			      }, 
			   
			}
		}
	},

	{
		// Stage 2 - excluded
		stage: 2,  source: {
			$group: { 
			  
			
			        "_id": {
			          "_id":"$_id",
			          "_form_name": "$_form_name"
			        },
			       // "root": "$$ROOT"
			        
			        //  'Histolopathologic Report - T size': { $push: "$Histolopathologic Report - T size" },
			        
			          usersSalaries: {$push:{ label:"$$ROOT"}}, 
			          usersSalaries1: {$push:"$$ROOT"}, 
			          usersSalaries2: {$push: { $objectToArray: "$$ROOT.v" } }, 
			         
			          usersalaries3: {
			            $push: {
			                 "k": {
			                $let:
			                     {
			                   vars: {  varin: { $objectToArray: "$$ROOT"  } },
			                   in: {
			             
			               
			                  $map: {
			                        input:  "$$varin" ,
			                         as: "value",
			                         in: "$$value.k"
			                       }
			                     }
			                     }
			             },
			             "v": {
			                $let:
			                     {
			                   vars: {  varin: { $objectToArray: "$$ROOT"  } },
			                   in: {
			             
			               
			                  $map: {
			                        input:  "$$varin" ,
			                         as: "value",
			                         in: "$$value.v"
			                       }
			                     }
			                     }
			             }
			             
			            }
			          }
			         
			          
			          
			     
			      //   'Histolopathologic Report - T size': { $push: "$Histolopathologic Report - T size" },
			      // 'Diagnosis - Laterality' : { $push: "$Diagnosis - Laterality"},
			      //  'Chemotherapy - Number of cycles' : { $push: "$Chemotherapy - Number of cycles" }
			}
		}
	},

	{
		// Stage 10 - excluded
		stage: 10,  source: {
			$unwind: {
			    path : "$results",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		}
	},
]

db.getCollection("medicalreports").aggregate(

	// Pipeline
	[
		// Stage 3
		{
			$project: {         
			           
			       "_id": {
			          "_id":"$AA_id",
			          "_form_name": "$AA_form_name"
			        },
			       "TEST":  { $objectToArray: "$$ROOT" } ,
			       "results" : {
			       //$arrayToObject: {
			        $map: {
			           input:  { $objectToArray: "$$ROOT" } ,
			           as: "fuck",
			           in:   
			           //2nd param
			           {
			               "$cond" : {
			                     
			                     "if" : 
			                          //value is string 
			                         {  "$eq" : [   { $type: "$$fuck.v" } , 'string' ] },
			                       
			                      
			                     
			                     
			                     
			                       "then" : { 
			                         
			                          "$cond" : {
			                            "if":  {  "$ne" : [   "$$fuck.v"  , "" ]  }, 
			                             //not empty string
			                            "then": {
			                              
			                             $arrayToObject: {
			                              $map: {
			                                 input: { $objectToArray: "$$fuck" },
			                                    as: "value",
			                                       in: [ 
			                                           { $concat: [ "$$fuck.k", " - ", "$$fuck.v" ] }, 
			                                            NumberInt(1) 
			                                       ]
			                              }  
			                           }
			                            
			                            },
			                            //emtpy string
			                            "else": { }
			                          }
			                          
			                          
			                         
			                         
			                           
			                           
			                                
			                       },
			                       //values is not array
			            
			                     //"else" : { $arrayToObject: { $literal: [ { "k": "Primary Organ Site", "v": "Breast"} ] } },
			                        //value is NOT string 
			                       "else" : { 
			                    
			                              //NOT empty
			                          $arrayToObject: {
			                              $map: {
			                                 input: { $objectToArray: "$$fuck" },
			                                    as: "value",
			                                       in: {
			                                           // "$$root.k" , 
			                                          "k": "$$fuck.k",
			                                          // {$concat: [ "$$root.k", "-", "$$value.v" ] } , 
			                                          //"v":  NumberInt(3) 
			                                          "v": "$$fuck.v"
			                                       }
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

		// Stage 4
		{
			$project: {
			   "_id": 1,
			
			   
			   "results" :  {
			     $filter: {
			      input: "$$ROOT.results" ,
			       as: "item",
			       cond: { $ne: [ {$size: {$objectToArray: "$$item" } } , 0 ] }
			     }
			   },
			   
			 
			}
		},

		// Stage 5
		{
			$project: {
			    "_form_name": 1,
			    "_id":1,
			      "results":  1 ,
			     "map": { 
			       //$objectToArray: {
			       $map: {
			           input: "$results" ,
			           as: "array",
			           in: [
			            { $mergeObjects: {
			              $map: {
			                input:  { $objectToArray: "$$array" } ,
			                 as: "value",
			                 in: 
			                 { 
			                   "key": "$$value.k" ,
			                   "value": "$$value.v" 
			                 }
			             }
			            }
			            }                   
			
			           ]
			       }
			
			     }
			   
			}
		},

		// Stage 6
		{
			$unwind: {
			    path : "$map",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 7
		{
			$unwind: {
			    path : "$map",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 8
		{
			$group: {
			    "_id": {
			      "_id": "$_id._id",
			      "_form_name": "$_id._form_name"
			     
			    },
			   "results": { $push : "$map" } 
			}
		},

		// Stage 9
		{
			$unwind: {
			    path : "$results",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 11
		{
			$addFields: {
			   "results._form_name" : "$_id._form_name",
			   "results._case_number" : "$_id._case_number",
			   "results._form_id" : "$_id._form_id",
			   "results._case_id" : "$_id._case_id",
			}
		},

		// Stage 12
		{
			$replaceRoot: {
			  newRoot: "$results"
			}
		},

		// Stage 13
		{
			$group: {
			    "_id": {
			  // "form":"$_form_name",
			    "label":"$key",
			   },
			   count: { $sum: NumberInt(1) }
			}
		},

		// Stage 14
		{
			$sort: {
			    "_id.label" : 1
			}
		},

		// Stage 15
		{
			$project: { 
			  //"ROOT": "$$ROOT",
			  //"count":1,
			  "tally": 
			   {
			     $arrayToObject: {
			     $map: {
			     input:  { $objectToArray: "$_id" } ,
			          as: "root",
			          in: 
			          ["$$root.v", "$count"]
			     } 
			          
			     }
			   }
			}
		},

		// Stage 16
		{
			$group: {
			    "_id": "$_id.case_number",
			    "results": { $mergeObjects: "$tally" } 
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
			$out: "medicalreportcounts"
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
