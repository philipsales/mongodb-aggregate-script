db.forms.aggregate(

	// Pipeline
	[
		// Stage 2
		{
			$project: {
			    "_id" : "$_id",
			    "name" : "$name",
			    "organization" : "$organization",
			    "sections" : "$sections",
			    "answers_option" : {
			               "$map" : {
			                 "input" : "$sections.questions.options",
			                  "as" : "options",
			                  "in" : "$$options"
			             }
			    }
			}
		},

		// Stage 3
		{
			$unwind: {
			    path : "$answers_option",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 4
		{
			$unwind: {
			    path : "$answers_option",
			    includeArrayIndex : "arrayIndex", // optional
			    preserveNullAndEmptyArrays : false // optional
			}
		},

		// Stage 5
		{
			$group: {
			     "_id": { 
			       "_id": "$_id" ,
			       "form_name": "$name", 
			       "organization": "$organization" 
			      },
			  
				"options" : { $push: "$answers_option" } 
			
			     
			}
		},

		// Stage 6
		{
			$out: "questions_options"
		},

	]

	// Created with Studio 3T, the IDE for MongoDB - https://studio3t.com/

);
