# Generated by Django 3.2.7 on 2021-09-29 19:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('django_app', '0002_auto_20210914_1735'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='taskhistory',
            name='task_image_num',
        ),
        migrations.AddField(
            model_name='taskhistory',
            name='end_time',
            field=models.CharField(max_length=20, null=True, verbose_name='clip 종료 시간'),
        ),
        migrations.AddField(
            model_name='taskhistory',
            name='start_time',
            field=models.CharField(max_length=20, null=True, verbose_name='clip 시작 시간'),
        ),
        migrations.AlterField(
            model_name='taskhistory',
            name='task_id',
            field=models.AutoField(primary_key=True, serialize=False, verbose_name='자동 할당 번호(클립 ID)'),
        ),
    ]
