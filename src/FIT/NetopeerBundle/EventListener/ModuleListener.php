<?php
/*
* @author David Alexa <alexa.david@me.com>
*
* Copyright (C) 2012-2015 CESNET
*
* LICENSE TERMS
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions
* are met:
* 1. Redistributions of source code must retain the above copyright
*    notice, this list of conditions and the following disclaimer.
* 2. Redistributions in binary form must reproduce the above copyright
*    notice, this list of conditions and the following disclaimer in
*    the documentation and/or other materials provided with the
*    distribution.
* 3. Neither the name of the Company nor the names of its contributors
*    may be used to endorse or promote products derived from this
*    software without specific prior written permission.
*
* ALTERNATIVELY, provided that this notice is retained in full, this
* product may be distributed under the terms of the GNU General Public
* License (GPL) version 2 or later, in which case the provisions
* of the GPL apply INSTEAD OF those given above.
*
* This software is provided ``as is'', and any express or implied
* warranties, including, but not limited to, the implied warranties of
* merchantability and fitness for a particular purpose are disclaimed.
* In no event shall the company or contributors be liable for any
* direct, indirect, incidental, special, exemplary, or consequential
* damages (including, but not limited to, procurement of substitute
* goods or services; loss of use, data, or profits; or business
* interruption) however caused and on any theory of liability, whether
* in contract, strict liability, or tort (including negligence or
* otherwise) arising in any way out of the use of this software, even
* if advised of the possibility of such damage.
*/

namespace FIT\NetopeerBundle\EventListener;

use Doctrine\ORM\EntityManager;
use FIT\NetopeerBundle\Entity\ConnectionSession;
use Monolog\Logger;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use FIT\NetopeerBundle\Models\Data;

class ModuleListener
{
	/**
	 * @var EntityManager
	 */
	private $em;
	/**
	 * @var \Monolog\Logger
	 */
	private $logger;
	/**
	 * @var ConnectionFunctionality
	 */
	private $connectionFunc;

	/**
	 * @param Data          $connectionFunc
	 * @param EntityManager $em
	 * @param Logger        $logger
	 * @param
	 */
	public function __construct($connectionFunc = null, $em = null, $logger = null)
	{
		$this->connectionFunc = $connectionFunc;
		$this->em = $em;
		$this->logger = $logger;
	}

	/**
	 * This method checks module name, loads mapping info from ModuleController
	 * entity, and calls specified controller from custom ModuleBundle
	 *
	 * @param GetResponseEvent $event
	 */
	public function onKernelController(GetResponseEvent $event)
	{
		if ($this->em) {
			$attributes = $event->getRequest()->attributes;
			if (in_array($attributes->get("_route"), array("module", "subsection"))) {

				// get available namespaces for this connection
				$namespace = $this->connectionFunc->getNamespaceForModule($attributes->get('key'), $attributes->get('module'));
				if ($namespace !== false) {
					$record = $this->connectionFunc->getModuleControllers($attributes->get('module'), $namespace);

					if ($record) {
						// get all saved controllers from DB
						$controllers = $record->getControllerActions();

						/**
						 * @var ConnectionSession $conn
						 */
						$conn = $this->connectionFunc->getConnectionSessionForKey($attributes->get('key'));
						$activeController = $conn->getActiveControllersForNS($namespace);

						// if we don't have any saved (preferred) controller, we will use first from DB
						if (!$activeController) {
							$activeController = $controllers[0];
						}

						$event->getRequest()->attributes->set("_controller", $activeController);
					}
				}

			}
		}
	}
}