# Generated by Django 4.2.4 on 2023-11-24 23:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='JobType',
            fields=[
                ('Id', models.AutoField(primary_key=True, serialize=False)),
                ('Type', models.CharField(max_length=50)),
            ],
        ),
        migrations.RenameField(
            model_name='job',
            old_name='name',
            new_name='Name',
        ),
        migrations.AddField(
            model_name='job',
            name='SettingTemp',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='joblog',
            name='CoolTemp',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='joblog',
            name='HeatTemp',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='joblog',
            name='Mode',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='joblog',
            name='ActualTemp',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='joblog',
            name='SetPointTemp',
            field=models.DecimalField(decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name='job',
            name='JobTypeId',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='core.jobtype'),
        ),
    ]