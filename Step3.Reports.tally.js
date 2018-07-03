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
		// Stage 3 - excluded
		stage: 3,  source: {
			$group: { 
			  
			      // "ROOT_objectArray": { $objectToArray: "$$ROOT" } ,
			      // "ROOT_object": "$$ROOT"  ,
			       // "_form_id" : 1,
			        "_id": {
			          "_id":"$_id",
			          "_form_name": "$_form_name"
			        },
			      "Histolopathologic Report - T size" : "< 0.5 cm", 
			      // 'Histolopathologic Report - T size': { $push: "$Histolopathologic Report - T size" },
			     //   'Histolopathologic Report - T size': { $push: "$Histolopathologic Report - T size" },
			       //'Diagnosis - Laterality' : { $push: "$Diagnosis - Laterality"},
			       // 'Chemotherapy - Number of cycles' : { $push: "$Chemotherapy - Number of cycles" }
			}
		}
	},
]

db.getCollection("medicalreports").aggregate(

	// Pipeline
	[
		// Stage 4
		{
			$project: {         
			           
			     //"Diagnosis - Laterality" : { $size: "$Diagnosis - Laterality"},
			      "ROOT" :  "$$ROOT",
			     //"laterality" : { $size: "$Chemotherapy - Number o
			     "objectToArray" :{ $objectToArray: "$$ROOT"},
			     //"laterality" : { $size: "$Chemotherapy - Number of cycles"}
			     //"_form_name": "$_form_name",
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
			                     "if" : {  "$eq" : [   { $type: "$$root.v" } , "array" ] } , 
			                       "then" : { 
			                      	  $arrayToObject: {
			                              $map: {
			                                 input: "$$root.v" ,
			                                    as: "value",
			                                       in: [ 
			                                           { $concat: [ "$$root.k", " - ", "$$value" ] }, 
			                                           { $sum: NumberInt(1) }
			                                       ]
			                              }  
			                           }
			
			                       },
			                       //values is not array
			            
			                     //"else" : { $arrayToObject: { $literal: [ { "k": "Primary Organ Site", "v": "Breast"} ] } },
			    
			                      // "else" : "$$root.v"
			                        "else" : {  }
			                       
			                     
			                      
			                 }
			              
			            }
			          }
			     //}
			    }
			    
			     
			     
			}
		},

		// Stage 5
		{
			$unwind: {
			    path : "$map",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 6
		{
			$group: {
			     _id: "$_id", 
			     //"form": "$_id.form", 
			     "results": { $push: "$map" } 
			}
		},

		// Stage 7
		{
			$project: {
			   "_id": 1,
			   
			   "results" :  {
			     $filter: {
			      input: "$$ROOT.results" ,
			       as: "item",
			       cond: { $eq: [ {$size: {$objectToArray: "$$item" } } , 1 ] }
			     }
			   },
			 
			}
		},

		// Stage 8
		{
			$project: {
			    "_form_name": 1,
			    "_id":1,
			    "map": {
			     // $arrayToObject: {
			       $map: {
			           input:  "$$ROOT.results"  ,
			           as: "root",
			          // in:  { $objectToArray: "$$root" }
			          in: {
			            //$arrayToObject: {
			             $map: {
			          		 input:  { $objectToArray: "$$root" } ,
			         		  as: "label",
			         		  in:  {
			         		   
			         		     "key":"$$label.k",
			         		      "value":"$$label.v"
			         		  }
			          
			    	 	      }
			            
			          }
			       //   } 
			    	   }
			    //  }
			   	 
			    }
			}
		},

		// Stage 9
		{
			$unwind: {
			    path : "$map",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 10
		{
			$unwind: {
			    path : "$map",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 11
		{
			$group: {
				"_id": {
				  "_id": "$_id._id",
				  "_form_name": "$_id._form_name"
				},
			   "results": { $push : "$map" } 
			}
		},

		// Stage 12
		{
			$unwind: {
			    path : "$results",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 13
		{
			$addFields: {
				"results._form_name" : "$_id._form_name"
			}
		},

		// Stage 14
		{
			$replaceRoot: {
			  newRoot: "$results"
			}
		},

		// Stage 15
		{
			$group: {
			   "_id": {
			  // "form":"$_form_name",
			    "label":"$key",
			   },
			   count: { $sum: NumberInt(1) }
			}
		},

		// Stage 16
		{
			$sort: {
			    "_id.label" : 1
			}
		},

		// Stage 17
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

		// Stage 18
		{
			$group: {
				"_id": "$label",
				"results": { $mergeObjects: "$tally" } 
			}
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
