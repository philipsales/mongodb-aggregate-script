db.getCollection("forms").aggregate(

	// Pipeline
	[
		// Stage 1
		{
			$project: {
			    "_id" : "$_id",
			    "name" : "$name",
			    "organization" : "$organization",
			    "sections" : "$sections",
			    "answers_type" : {
			        "$map" : {
			            "input" : "$sections.questions",
			            "as" : "type",
			            "in": {
			            "$map" : {
			                "input" : "$$type.type",
			                "as" : "value",
			                /*
			                "in" : {
			                    $concat: [
			                        { 
			                            $arrayElemAt: [ 
			                                "$sections.name", 
			                                { 
			                                    "$indexOfArray" : [ "$sections.questions.type", "$$type.type" ] 
			                                } 
			                            ] 
			                        },
			                        ".",
			                        "$$value",
			                    ]
			                }
			                */
			                "in" :  "$$value"
			                    
			                
			            }
			        }
			      }
			    }
			}
		},

		// Stage 2
		{
			$unwind: {
			    path : "$answers_type",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 3
		{
			$unwind: {
			    path : "$answers_type",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 4
		{
			$group: {
			     "_id": { 
			       "_id": "$_id" ,
			       "form_name": "$name", 
			       "organization": "$organization" 
			      },
			     "type" : { $push: "$answers_type" } ,
			    
			}
		},

		// Stage 5
		{
			$out: "questions_type"
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
