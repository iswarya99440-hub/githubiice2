# Generated manually for partner organization portal support.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("internships", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="organization",
            name="partner_user",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="partner_organization",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="organization",
            name="contact_phone",
            field=models.CharField(blank=True, max_length=30),
        ),
        migrations.AddField(
            model_name="organization",
            name="industry",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="organization",
            name="website",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="organization",
            name="description",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="organization",
            name="capacity",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="organization",
            name="status",
            field=models.CharField(
                choices=[
                    ("ACTIVE", "Active"),
                    ("PENDING", "Pending"),
                    ("SUSPENDED", "Suspended"),
                ],
                default="ACTIVE",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="organization",
            name="settings",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="organization",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="organization",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name="internshipposition",
            name="requirements",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="internshipposition",
            name="location",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="internshipposition",
            name="start_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="internshipposition",
            name="end_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="internshipposition",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="internshipposition",
            name="created_at",
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
