from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("authapi", "0004_user_partner_role"),
        ("reports", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="report",
            name="supervisor_approved",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="report",
            name="supervisor_approved_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="report",
            name="supervisor_approved_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="approved_reports",
                to="authapi.supervisorprofile",
            ),
        ),
    ]
