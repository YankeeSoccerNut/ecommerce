import React, { Component } from 'react';

class Student extends Component{

	render(){
		var students = [
			'Casey',
			'Eddie',
			'Jamie',
			'Valerie'
		];
		var studentArray = students.map((student)=>{
			return (<li>{student}</li>)
		})
		return(
			<div>
				{studentArray}
			</div>
		)
	}
}

export default Student;