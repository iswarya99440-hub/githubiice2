from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("authapi", "0005_user_institution_email_verified"),
        ("reports", "0002_report_supervisor_approval"),
    ]

    operations = [
        migrations.AddField(
            model_name="report",
            name="coordinator_feedback",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="report",
            name="coordinator_approved",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="report",
            name="coordinator_approved_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="report",
            name="coordinator_approved_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="coordinator_approved_reports",
                to="authapi.user",
            ),
        ),
    ]
