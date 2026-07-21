import { db } from "../config/connectDb";

const applyAssociations = () => {
	const exercisesModel = db.models.Exercises as any;
	const musclesModel = db.models.Muscles as any;
	const constraintsModel = db.models.Constraints as any;
	const exerciseMusclesModel = db.models.ExerciseMuscles as any;
	const exerciseConstraintsModel = db.models.ExerciseConstraints as any;

	if (exercisesModel && musclesModel && exerciseMusclesModel) {
		exercisesModel.belongsToMany(musclesModel, {
			through: exerciseMusclesModel,
			foreignKey: "exercise_id",
			otherKey: "muscle_id",
			as: "muscles",
		});

		musclesModel.belongsToMany(exercisesModel, {
			through: exerciseMusclesModel,
			foreignKey: "muscle_id",
			otherKey: "exercise_id",
			as: "exercises",
		});
	}

	if (exercisesModel && constraintsModel && exerciseConstraintsModel) {
		exercisesModel.belongsToMany(constraintsModel, {
			through: exerciseConstraintsModel,
			foreignKey: "exercise_id",
			otherKey: "constraint_id",
			as: "constraints",
		});

		constraintsModel.belongsToMany(exercisesModel, {
			through: exerciseConstraintsModel,
			foreignKey: "constraint_id",
			otherKey: "exercise_id",
			as: "exercises",
		});
	}
};

applyAssociations();

const Associations = {
	name: "Associations",
};

export default Associations;
