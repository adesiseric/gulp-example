(function () {

    'use strict';

    angular.module('selectApp')
    .controller('MainCtrl', MainCtrl);

    function MainCtrl ($scope) {

        function setup () {
            $scope.address = {
                selected: null
            };
            $scope.direccion = [
                {
                    codigoInterno: "1",
                    descripcionInterna: "Claveria"
                },
                {
                    codigoInterno: "2",
                    descripcionInterna: "Bosques"
                },
                {
                    codigoInterno: "3",
                    descripcionInterna: "Vergel"
                },
                {
                    codigoInterno: "4",
                    descripcionInterna: "Obrera"
                },
                {
                    codigoInterno: "5",
                    descripcionInterna: "5"
                },
                {
                    codigoInterno: "6",
                    descripcionInterna: "6"
                },
                {
                    codigoInterno: "7",
                    descripcionInterna: "7"
                },
                {
                    codigoInterno: "8",
                    descripcionInterna: "8"
                },
                {
                    codigoInterno: "9",
                    descripcionInterna: "9"
                },
                {
                    codigoInterno: "10",
                    descripcionInterna: "10"
                }

            ];

            $scope.address.selected = $scope.direccion[3];
        }

        setup();
    }

})();