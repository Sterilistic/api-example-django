from django.conf.urls import include, url
from django.contrib.auth.decorators import login_required
from django.views.generic import TemplateView
from django.contrib import admin
admin.autodiscover()

import views


urlpatterns = [
    # url(r'^$', views.SetupView.as_view(), name='setup'),
    url(r'^$', views.welcome, name='landing'),
    url(r'^welcome/$', views.welcome, name='welcome'),
    url(r'^doctor/$',views.doctor_welcome, name='doctor'), #views.DoctorWelcome.as_view(), name='doctor'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^logout/$', views.logout, name='logout'),
    url(r'', include('social.apps.django_app.urls', namespace='social')),
    url(r'^checkin_patient_portal/', views.checkin_patient_portal, name='checkin_patient_portal'),
    url(r'^update_demographics_info/', views.update_demographics_info, name='update_demographics_info'),
    url(r'^call_patient/', views.call_patient, name='call_patient'),
    url(r'^appointment_completed/', views.appointment_completed, name='appointment_completed'),
    url(r'^sync_updates/', views.sync_updates, name='sync_updates'),
    url(r'^ajax/autocomplete/$', views.autocomplete, name='ajax_autocomplete'),
]