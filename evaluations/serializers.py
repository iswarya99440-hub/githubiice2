from rest_framework import serializers
from .models import Evaluation, EvaluationCriterion, EvaluationRating
from auth.models import User, StudentProfile


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "profile_picture"]


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = ["id", "student_id", "program", "year_of_study", "graduation_date", "skills", "user"]


class EvaluationCriterionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCriterion
        fields = ["id", "name", "description", "max_score", "is_active"]


class EvaluationRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationRating
        fields = ["id", "evaluation", "criterion", "score", "comment"]

    def validate(self, attrs):
        criterion = attrs.get("criterion") or getattr(self.instance, "criterion", None)
        score = attrs.get("score")
        if criterion and score is not None and score > criterion.max_score:
            raise serializers.ValidationError({"score": f"Score cannot exceed the criterion maximum of {criterion.max_score}."})
        return attrs


class EvaluationSerializer(serializers.ModelSerializer):
    ratings = EvaluationRatingSerializer(many=True, read_only=True)
    student_details = StudentProfileSerializer(source="student", read_only=True)
    max_score = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()
    score_out_of_20_component = serializers.SerializerMethodField()

    class Meta:
        model = Evaluation
        fields = [
            "id",
            "student",
            "student_details",
            "supervisor",
            "evaluation_type",
            "score",
            "max_score",
            "percentage",
            "score_out_of_20_component",
            "feedback",
            "created_at",
            "ratings",
        ]
        read_only_fields = ["id", "created_at"]

    def get_max_score(self, obj):
        return 50

    def get_percentage(self, obj):
        return round((obj.score / 50) * 100, 1)

    def get_score_out_of_20_component(self, obj):
        return round((obj.score / 50) * 10, 2)

    def validate_score(self, value):
        if value < 0 or value > 50:
            raise serializers.ValidationError("Score must be between 0 and 50 for each midterm or final evaluation.")
        return value

    def validate_student(self, value):
        if value is None:
            raise serializers.ValidationError("Student is required.")

        if isinstance(value, StudentProfile):
            return value

        student_profile = StudentProfile.objects.filter(pk=value).first()
        if student_profile:
            return student_profile

        user = User.objects.filter(pk=value, role=User.Role.STUDENT).first()
        if user:
            student_profile = getattr(user, "studentprofile", None)
            if student_profile:
                return student_profile

        raise serializers.ValidationError("Selected student does not exist.")


class EvaluationSummarySerializer(serializers.Serializer):
    student = StudentProfileSerializer()
    midterm = EvaluationSerializer(allow_null=True)
    final = EvaluationSerializer(allow_null=True)
    midterm_score = serializers.IntegerField(allow_null=True)
    final_score = serializers.IntegerField(allow_null=True)
    total_score = serializers.IntegerField()
    total_max_score = serializers.IntegerField()
    final_score_out_of_20 = serializers.FloatField(allow_null=True)
    is_complete = serializers.BooleanField()
