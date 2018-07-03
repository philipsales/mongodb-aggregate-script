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
			    "answers_label" : {
			        "$map" : {
			            "input" : "$sections.questions",
			            "as" : "label",
			            "in": {
			            "$map" : {
			                "input" : "$$label.label",
			                "as" : "value",
			                "in" : {
			                    $concat: [
			                        { 
			                            $arrayElemAt: [ 
			                                "$sections.name", 
			                                { 
			                                    "$indexOfArray" : [ "$sections.questions.label", "$$label.label" ] 
			                                } 
			                            ] 
			                        },
			                        ".",
			                        "$$value",
			                    ]
			                }
			            }
			        }
			    }
			},
			   
			"answers_keys" : {
			        "label" : {
			            "$map" : {
			                "input" : "$sections.questions.label",
			                "as" : "label",
			                "in" : "$$label"
			            }
			        },
			        "keys" : {
			            "$map" : {
			                "input" : "$sections.questions.key",
			                "as" : "key",
			                "in" : "$$key"
			            }
			        }
			    }
			}
		},

		// Stage 2
		{
			$unwind: {
			    path : "$answers_label",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 3
		{
			$unwind: {
			    path : "$answers_label",
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
			     "label" : { $push: "$answers_label" } ,
			}
		},

		// Stage 5
		{
			$out: "questions_label"
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
