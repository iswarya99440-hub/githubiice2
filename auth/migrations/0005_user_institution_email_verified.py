from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authapi", "0004_user_partner_role"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="institution_email_verified",
            field=models.BooleanField(default=False),
        ),
    ]
