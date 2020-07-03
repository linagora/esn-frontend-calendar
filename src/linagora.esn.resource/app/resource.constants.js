(function(angular) {
  'use strict';

  angular.module('linagora.esn.resource')
    .constant('ESN_RESOURCE_OBJECT_TYPE', 'resource')
    .constant('ESN_RESOURCE', {
      TYPES: ['admin', 'directory', 'resource', 'calendar'],
      DEFAULT_ICON: 'home',
      ICONS: {
        'access-point': 'mdi-access-point',
        battery: 'mdi-battery',
        briefcase: 'mdi-briefcase',
        calculator: 'mdi-calculator',
        camera: 'mdi-camera',
        car: 'mdi-car',
        caravan: 'mdi-caravan',
        cellphone: 'mdi-cellphone',
        coffee: 'mdi-coffee',
        'credit-card': 'mdi-credit-card',
        deskphone: 'mdi-deskphone',
        'guitar-acoustic': 'mdi-guitar-acoustic',
        fax: 'mdi-fax',
        home: 'mdi-home',
        kettle: 'mdi-kettle',
        laptop: 'mdi-laptop',
        microphone: 'mdi-microphone',
        motorbike: 'mdi-motorbike',
        office: 'mdi-office',
        parking: 'mdi-parking',
        phone: 'mdi-phone',
        projector: 'mdi-projector',
        radio: 'mdi-radio',
        remote: 'mdi-remote',
        soccer: 'mdi-soccer',
        sofa: 'mdi-sofa',
        tablet: 'mdi-tablet',
        train: 'mdi-train',
        umbrella: 'mdi-umbrella',
        video: 'mdi-video',
        wifi: 'mdi-wifi'
      }
    });
})(angular);
