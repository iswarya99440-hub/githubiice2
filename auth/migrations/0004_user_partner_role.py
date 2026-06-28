# Generated manually for partner organization portal support.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authapi", "0003_user_phone"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("Admin", "Administrator"),
                    ("Supervisor", "Supervisor"),
                    ("Coordinator", "Coordinator"),
                    ("Student", "Student"),
                    ("Partner", "Partner Organization"),
                ],
                max_length=20,
            ),
        ),
    ]
