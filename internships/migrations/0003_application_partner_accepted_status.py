# Generated manually for two-step partner/admin application approval.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("internships", "0002_partner_portal_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="application",
            name="status",
            field=models.CharField(
                choices=[
                    ("PENDING", "Pending"),
                    ("PARTNER_ACCEPTED", "Partner Accepted"),
                    ("APPROVED", "Approved"),
                    ("REJECTED", "Rejected"),
                ],
                default="PENDING",
                max_length=20,
            ),
        ),
    ]
